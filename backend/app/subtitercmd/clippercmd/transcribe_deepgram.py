# flake8: noqa: E501
from config import Settings
import click
import os
import requests
from .utils import (
    _split_audio_for_transcription,
    _combine_srt_files
)


def _transcribe_and_generate_srt_deepgram(audio_file, output_srt_file, api_key):
    """Transcribes audio and generates an SRT file using Deepgram API."""
    click.echo(f"Transcribing {audio_file} with Deepgram API...")

    try:
        # Deepgram API endpoint for transcription
        url = "https://api.deepgram.com/v1/listen"

        # Set up headers with API key
        headers = {
            "Authorization": f"Token {api_key}",
            "Content-Type": "audio/mp3"
        }

        # Parameters for transcription
        params = {
            "model": "nova-2",  # or other available models
            "language": "en",  # specify language if needed
            "punctuate": "true",
            "paragraphs": "true",
            "smart_format": "true"
        }

        # Read the audio file
        with open(audio_file, "rb") as audio:
            audio_data = audio.read()

        # Make the API request
        response = requests.post(
            url,
            headers=headers,
            params=params,
            data=audio_data,
            timeout=300  # 5 minutes timeout
        )

        response.raise_for_status()

        # Parse the response
        result = response.json()

        # Extract transcript with word-level timestamps
        transcript_data = result.get("results", {}).get("channels", [{}])[0]
        alternatives = transcript_data.get("alternatives", [{}])[0]

        # Generate SRT format
        srt_content = _convert_deepgram_to_srt(alternatives)

        # Write SRT file
        with open(output_srt_file, "w", encoding="utf-8") as f:
            f.write(srt_content)

        click.secho(f"Generated SRT: {output_srt_file}", fg="green")

    except requests.RequestException as e:
        click.secho(f"An error occurred with the Deepgram API: {e}", fg="red")
        raise click.Abort()
    except Exception as e:
        click.secho(f"An unexpected error occurred: {e}", fg="red")
        raise click.Abort()


def _convert_deepgram_to_srt(alternatives):
    """Convert Deepgram response to SRT format."""

    words = alternatives.get("words", [])

    if not words:
        return ""

    srt_entries = []
    subtitle_index = 1

    # Group words into subtitle entries based on timing and content
    current_entry_words = []
    current_start_time = None
    current_end_time = None
    max_words_per_line = 8  # Limit words per subtitle line
    max_chars_per_line = 50  # Limit characters per subtitle line

    def format_timestamp(seconds):
        """Format seconds to SRT timestamp format (HH:MM:SS,mmm)."""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        milliseconds = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"

    def add_subtitle_entry():
        nonlocal subtitle_index, current_entry_words, current_start_time, current_end_time

        if current_entry_words and current_start_time is not None:
            # Combine words into text
            text = " ".join([word["word"] for word in current_entry_words])

            # Split long text into multiple lines
            lines = []
            current_line = ""
            words_in_text = text.split()

            for word in words_in_text:
                if len(current_line + " " + word) <= max_chars_per_line and \
                   len((current_line + " " + word).split()) <= max_words_per_line:
                    current_line += " " + word if current_line else word
                else:
                    if current_line:
                        lines.append(current_line)
                    current_line = word

            if current_line:
                lines.append(current_line)

            # Format SRT entry
            start_time = format_timestamp(current_start_time)
            end_time = format_timestamp(current_end_time)

            srt_entry = f"{subtitle_index}\n{start_time} --> {end_time}\n"
            srt_entry += "\n".join(lines) + "\n\n"

            srt_entries.append(srt_entry)
            subtitle_index += 1

        current_entry_words = []
        current_start_time = None

    for i, word in enumerate(words):
        word_start = word["start"]
        word_end = word["end"]

        # Check if we should start a new subtitle entry
        if current_start_time is None:
            current_start_time = word_start
            current_end_time = word_end
        elif word_end - current_start_time > 8.0:  # Max 8 seconds per subtitle
            add_subtitle_entry()
            current_start_time = word_start
            current_end_time = word_end
        else:
            current_end_time = word_end

        current_entry_words.append(word)

        # Check if we have too many words for one subtitle
        if len(current_entry_words) >= max_words_per_line * 2:
            add_subtitle_entry()
            if i < len(words) - 1:
                current_start_time = words[i + 1]["start"]

    # Add the last entry
    add_subtitle_entry()

    return "".join(srt_entries)


def _transcribe_deepgram(audio_file, output_srt_file, settings):
    """Transcribes an audio file and generates an SRT file using Deepgram API."""

    # Check if Deepgram API key is available
    if not settings.DEEPGRAM_API_KEY:
        click.secho("Error: DEEPGRAM_API_KEY environment variable is not set.", fg="red")
        raise click.Abort()

    output_dir = os.path.dirname(output_srt_file)
    if not output_dir:
        output_dir = "."
    temp_dir = os.path.join(output_dir, "temp_transcribe_deepgram")
    os.makedirs(temp_dir, exist_ok=True)

    # Step 1: Split audio if it's too large
    audio_chunks = _split_audio_for_transcription(audio_file, temp_dir, 50)
    srt_files = []

    # Step 2: Transcribe each chunk
    for i, chunk_file in enumerate(audio_chunks):
        click.echo(f"Transcribing chunk {i + 1}/{len(audio_chunks)}...")
        srt_file = os.path.join(temp_dir, f"chunk_{i}.srt")
        try:
            _transcribe_and_generate_srt_deepgram(chunk_file, srt_file, settings.DEEPGRAM_API_KEY)
            srt_files.append(srt_file)
        except click.Abort:
            click.secho(
                f"Transcription failed for chunk {chunk_file}. Aborting.",
                fg="red"
            )
            # Clean up temp files before exiting
            for f in audio_chunks + srt_files:
                if os.path.exists(f) and temp_dir in f:
                    os.remove(f)
            os.rmdir(temp_dir)
            raise

    # Step 3: Combine SRT files
    if len(srt_files) > 1:
        _combine_srt_files(srt_files, output_srt_file)
        click.secho("All chunks transcribed and combined.", fg="green")
    else:
        # If there was only one chunk, just move the SRT file
        os.rename(srt_files[0], output_srt_file)
        click.secho(
            f"Transcription complete. SRT file saved as {output_srt_file}",
            fg="green"
        )

    # Step 4: Cleanup temporary files
    click.echo("Cleaning up temporary chunk files...")
    for f in audio_chunks + srt_files:
        if os.path.exists(f) and temp_dir in f:
            try:
                os.remove(f)
            except OSError as e:
                click.secho(
                    f"Could not remove temp file {f}: {e}", fg="yellow"
                )
    try:
        os.rmdir(temp_dir)
    except OSError as e:
        click.secho(
            f"Could not remove temp directory {temp_dir}: {e}", fg="yellow"
        )

@click.command('transcribe-deepgram')
@click.option(
    '--audio-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Input audio file."
)
@click.option(
    '--output-srt-file',
    required=True,
    type=click.Path(),
    help="Output SRT subtitle file."
)
@click.pass_context
def transcribe_deepgram_command(ctx, audio_file, output_srt_file):
    """
    Transcribes an audio file and generates an SRT file using Deepgram API.
    """
    settings = ctx.obj
    _transcribe_deepgram(audio_file, output_srt_file, settings)