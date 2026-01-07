# flake8: noqa: E501
import uuid
import click
import os
import openai
from datetime import datetime
from pydub import AudioSegment

from .model.short_config_model import SubtitleCapitalizationMethod, SubtitleConfiguration
from .utils import _split_audio_for_transcription
from .ai_provider_cost_manager import _record_ai_provider_cost
from config import get_shorts_config, settings


def _format_timestamp_for_ass(seconds):
    """Converts seconds to ASS timestamp format (H:MM:SS.cc)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    
    return f"{hours}:{minutes:02d}:{secs:05.2f}"


def _transcribe_chunk_with_word_timing(audio_file, client):
    """Transcribes audio chunk and returns word-level timing data."""
    click.echo(f"Transcribing {audio_file} with word-level timing...")
    config = get_shorts_config()
    if config.config_json.video_language_code:
        language_code = config.config_json.video_language_code.value
    else:
        language_code = "en"
    try:
        # Calculate audio duration for cost tracking (fast method using ffprobe)
        from .utils import _get_audio_duration_fast
        duration_minutes = _get_audio_duration_fast(audio_file)
        
        with open(audio_file, "rb") as af:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=af,
                response_format="verbose_json",
                timestamp_granularities=["word"],
                language=language_code
            )
        
        # Calculate cost: $0.006 per minute (verify current pricing for gpt-4o-transcribe)
        cost = duration_minutes * 0.006
        
        # Record the cost
        try:
            user_id = config.get_user_id()
            video_id = config.get_video_id()
            _record_ai_provider_cost(
                user_id=user_id,
                video_id=video_id,
                cost=f"{cost:.6f}",
                operation_name="transcription_word_level_ass",
                provider="openai",
                model="gpt-4o-transcribe",
                usage=f"{duration_minutes:.2f} minutes",
                timestamp=datetime.utcnow().isoformat()
            )
        except Exception as e:
            click.secho(f"Warning: Failed to record AI cost: {e}", fg="yellow")
        
        return transcript
    except openai.APIError as e:
        click.secho(f"OpenAI API error: {e}", fg="red")
        raise click.Abort()


def _generate_ass_header():
    """Generates the ASS file header with styles for word highlighting."""
    return """[Script Info]
Title: Word-Level Highlighted Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFF,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _generate_word_level_ass(transcript_data, output_ass_file, words_per_subtitle=4, time_offset=0, capitalization_method=SubtitleCapitalizationMethod.DEFAULT):
    """Generates ASS file with word-level karaoke timing."""
    if not hasattr(transcript_data, 'words') or not transcript_data.words:
        click.secho("No word-level timing data available", fg="yellow")
        return 0
    
    words = transcript_data.words
    ass_content = [_generate_ass_header()]
    
    # Group words into subtitles
    i = 0
    while i < len(words):
        # Determine how many words to include in this subtitle
        remaining_words = len(words) - i
        if remaining_words <= 2:
            words_in_subtitle = remaining_words
        elif remaining_words == 6:
            words_in_subtitle = 3
        else:
            words_in_subtitle = min(words_per_subtitle, remaining_words)
        
        # Get the words for this subtitle
        subtitle_words = words[i:i + words_in_subtitle]
        
        # Calculate timing
        start_time = subtitle_words[0].start + time_offset
        end_time = subtitle_words[-1].end + time_offset
        
        # Create ASS karaoke line
        start_timestamp = _format_timestamp_for_ass(start_time)
        end_timestamp = _format_timestamp_for_ass(end_time)
        
        # Build karaoke text with \k tags for word highlighting
        # Each \k duration specifies how long that word is highlighted (in centiseconds)
        karaoke_text = ""
        
        for j, word in enumerate(subtitle_words):
            word_start = word.start + time_offset
            word_end = word.end + time_offset
            
            # Calculate the actual duration this word should be highlighted
            word_duration_cs = int((word_end - word_start) * 100)
            
            if j == 0:
                # First word: check if there's a delay from subtitle start
                delay_from_start = word_start - start_time
                if delay_from_start > 0.01:  # If more than 10ms delay
                    # Add empty karaoke timing for the silence before first word
                    delay_cs = int(delay_from_start * 100)
                    karaoke_text += f"{{\\k{delay_cs}}}"
                
                # Add the first word with its duration
                karaoke_text += f"{{\\k{word_duration_cs}}}{_apply_word_capitalization_on_word(word.word, capitalization_method)}"
            else:
                # For subsequent words: check gap from previous word
                prev_word_end = subtitle_words[j-1].end + time_offset
                gap_duration = word_start - prev_word_end
                
                if gap_duration > 0.01:  # If more than 10ms gap
                    # Add space with gap timing
                    gap_cs = int(gap_duration * 100)
                    karaoke_text += f" {{\\k{gap_cs}}}"
                    # Then add word with its duration (no space needed as it's in previous tag)
                    karaoke_text += f"{{\\k{word_duration_cs}}}{_apply_word_capitalization_on_word(word.word, capitalization_method)}"
                else:
                    # No significant gap, just add space and word
                    karaoke_text += f" {{\\k{word_duration_cs}}}{_apply_word_capitalization_on_word(word.word, capitalization_method)}"
        
        # Create ASS dialogue line
        ass_line = f"Dialogue: 0,{start_timestamp},{end_timestamp},Default,,0,0,0,,{karaoke_text}"
        ass_content.append(ass_line)
        
        i += words_in_subtitle
    
    # Write to file
    with open(output_ass_file, "w", encoding="utf-8") as f:
        f.write("\n".join(ass_content))
    
    click.secho(f"Generated word-level ASS with karaoke highlighting: {output_ass_file}", fg="green")
    return max(word.end for word in words) if words else 0


def _combine_word_level_ass_files(ass_files, output_path):
    """Combines multiple word-level ASS files into one."""
    if not ass_files:
        click.secho("No ASS files to combine", fg="yellow")
        return
    
    if len(ass_files) == 1:
        # If only one file, just rename it
        os.rename(ass_files[0], output_path)
        return
    
    combined_content = []
    header_added = False
    
    for ass_file in ass_files:
        with open(ass_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        if not header_added:
            # Add the full content of the first file (including header)
            combined_content.append(content)
            header_added = True
        else:
            # For subsequent files, only add the dialogue lines
            lines = content.split('\n')
            dialogue_started = False
            for line in lines:
                if line.startswith('Dialogue:'):
                    dialogue_started = True
                if dialogue_started:
                    combined_content.append(line)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write('\n'.join(combined_content))



def _apply_word_capitalization_on_word(word: str, capitalization_method: SubtitleCapitalizationMethod):
    if capitalization_method.value == SubtitleCapitalizationMethod.CAPITALIZE_FIRST_CHAR_IN_WORDS.value:
        return word.lower().capitalize()
    if capitalization_method.value == SubtitleCapitalizationMethod.UPPERCASE.value:
        return word.upper()
    if capitalization_method.value == SubtitleCapitalizationMethod.LOWERCASE.value:
        return word.lower()
    return word


def _apply_word_capitalization(transcript_data, subtitle_configuration: SubtitleConfiguration):
    """Applies word capitalization to the transcript data."""

    print(f"subtitle_configuration.subtitle_capitalization_method: {subtitle_configuration.subtitle_capitalization_method.value}")
    print(f"SubtitleCapitalizationMethod.CAPITALIZE_FIRST_CHAR_IN_WORDS.value: {SubtitleCapitalizationMethod.CAPITALIZE_FIRST_CHAR_IN_WORDS.value}")
    print(f"SubtitleCapitalizationMethod.UPPERCASE.value: {SubtitleCapitalizationMethod.UPPERCASE.value}")
    print(f"SubtitleCapitalizationMethod.LOWERCASE.value: {SubtitleCapitalizationMethod.LOWERCASE.value}")
    if subtitle_configuration.subtitle_capitalization_method.value == SubtitleCapitalizationMethod.CAPITALIZE_FIRST_CHAR_IN_WORDS.value:
        for word in transcript_data.words:
            word.word = word.word.lower().capitalize()
    if subtitle_configuration.subtitle_capitalization_method.value == SubtitleCapitalizationMethod.UPPERCASE:
        for word in transcript_data.words:
            word.word = word.word.upper()
    if subtitle_configuration.subtitle_capitalization_method.value == SubtitleCapitalizationMethod.LOWERCASE.value:
        for word in transcript_data.words:
            word.word = word.word.lower()
    print(f"transcript_data.words.sample: {[word.word for word in transcript_data.words[:5]]}")
    return transcript_data

def _transcribe_word_level_ass(audio_file, output_ass_file, words_per_subtitle=4, subtitle_configuration: SubtitleConfiguration=None):
    """Transcribes an audio file and generates word-level ASS file with karaoke highlighting."""
    
    client = openai.OpenAI(
        api_key=settings.OPENAI_API_KEY,
        timeout=300.0,  # 5 minute timeout per request
        max_retries=2   # Retry up to 2 times on failure
    )

    output_dir = os.path.dirname(output_ass_file)
    if not output_dir:
        output_dir = "."
    temp_dir = os.path.join(output_dir, "temp_transcribe_word_level_ass_"+str(uuid.uuid4()))
    os.makedirs(temp_dir, exist_ok=True)

    # Step 1: Split audio if it's too large
    audio_chunks = _split_audio_for_transcription(audio_file, temp_dir)
    ass_files = []
    cumulative_time_offset = 0

    # Step 2: Transcribe each chunk with word-level timing
    for i, chunk_file in enumerate(audio_chunks):
        click.echo(f"Processing chunk {i+1}/{len(audio_chunks)} for word-level ASS transcription...")
        ass_file = os.path.join(temp_dir, f"chunk_{i}_words.ass")
        
        try:
            # Get word-level transcript data
            transcript_data_original = _transcribe_chunk_with_word_timing(chunk_file, client)
            transcript_data = _apply_word_capitalization(transcript_data_original, subtitle_configuration)
            
            # Generate ASS with word-level karaoke timing
            chunk_duration = _generate_word_level_ass(
                transcript_data, 
                ass_file, 
                words_per_subtitle, 
                cumulative_time_offset,
                subtitle_configuration.subtitle_capitalization_method
            )
            
            # Only add to ass_files list if the file was actually created
            if chunk_duration > 0 and os.path.exists(ass_file):
                ass_files.append(ass_file)
                # Update time offset for next chunk
                cumulative_time_offset += chunk_duration
                
        except click.Abort:
            click.secho(
                f"Word-level ASS transcription failed for chunk {chunk_file}. Aborting.",
                fg="red"
            )
            # Clean up temp files before exiting
            for f in audio_chunks + ass_files:
                if os.path.exists(f) and temp_dir in f:
                    os.remove(f)
            os.rmdir(temp_dir)
            raise

    # Step 3: Combine ASS files
    if len(ass_files) == 0:
        click.secho("No ASS files were generated (no word-level timing data available)", fg="yellow")
        # Create an empty ASS file with just the header to avoid downstream errors
        with open(output_ass_file, "w", encoding="utf-8") as f:
            f.write(_generate_ass_header())
    elif len(ass_files) > 1:
        _combine_word_level_ass_files(ass_files, output_ass_file)
        click.secho("All chunks transcribed and combined into ASS format.", fg="green")
    else:
        # If there was only one chunk, just move the ASS file
        os.rename(ass_files[0], output_ass_file)
        click.secho(
            f"Word-level ASS transcription complete: {output_ass_file}",
            fg="green"
        )

    # Step 4: Cleanup temporary files
    click.echo("Cleaning up temporary chunk files...")
    for f in audio_chunks + ass_files:
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


@click.command('transcribe-word-level-ass')
@click.option(
    '--audio-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Input audio file."
)
@click.option(
    '--output-ass-file',
    required=True,
    type=click.Path(),
    help="Output ASS subtitle file with word-level karaoke highlighting."
)
@click.option(
    '--words-per-subtitle',
    default=4,
    type=click.IntRange(1, 5),
    help="Number of words per subtitle (1-5, default: 4)."
)
@click.option(
    '--capitalize-words',
    is_flag=True,
    default=False,
    help="Capitalize words in the ASS file."
)
@click.pass_context
def transcribe_word_level_ass_command(ctx, audio_file, output_ass_file, words_per_subtitle, capitalize_words):
    """
    Transcribes an audio file and generates an ASS file with word-level karaoke highlighting.
    Each word is highlighted as it's spoken using ASS karaoke tags.
    """
    
    _transcribe_word_level_ass(audio_file, output_ass_file, words_per_subtitle, capitalize_words)