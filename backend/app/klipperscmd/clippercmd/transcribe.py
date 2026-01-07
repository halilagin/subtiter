# flake8: noqa: E501
from config import Settings, settings
import click
import os
import openai
from .transcribe_deepgram import _transcribe_and_generate_srt_deepgram
from .utils import (
    _split_audio_for_transcription, _transcribe_and_generate_srt,
    _combine_srt_files
)



# def _transcribe(ctx, audio_file, output_srt_file):
#     """Wrapper for use in scripts that might not pass a full context."""
#     if ctx and hasattr(ctx, 'obj'):
#         click_settings = ctx.obj
#     else:
#         # Create a dummy settings object for script-based execution.
#         class Settings:
#             def __init__(self):
#                 self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
#         click_settings = Settings()

#     _transcribe_audio_file(audio_file, output_srt_file, click_settings)


def _transcribe_audio_file(audio_file, output_srt_file, click_settings):
    """Transcribes an audio file and generates an SRT file using OpenAI API."""
    client = openai.OpenAI(
        api_key=click_settings.OPENAI_API_KEY,
        timeout=300.0,  # 5 minute timeout per request
        max_retries=2   # Retry up to 2 times on failure
    )

    output_dir = os.path.dirname(output_srt_file)
    if not output_dir:
        output_dir = "."
    temp_dir = os.path.join(output_dir, "temp_transcribe")
    os.makedirs(temp_dir, exist_ok=True)

    # Step 1: Split audio if it's too large
    audio_chunks = _split_audio_for_transcription(audio_file, temp_dir)
    srt_files = []

    # Step 2: Transcribe each chunk
    for i, chunk_file in enumerate(audio_chunks):
        click.echo(f"Transcribing chunk {i+1}/{len(audio_chunks)}...")
        srt_file = os.path.join(temp_dir, f"chunk_{i}.srt")
        try:
            # _transcribe_and_generate_srt(chunk_file, srt_file, client)
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


@click.command('transcribe')
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
def transcribe_audio_file_command(ctx, audio_file, output_srt_file):
    """
    Transcribes an audio file and generates an SRT file using OpenAI API.
    """
    click_settings = ctx.obj
    
    _transcribe_audio_file(audio_file, output_srt_file, click_settings) 