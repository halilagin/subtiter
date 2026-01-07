# flake8: noqa: E501
from config import Settings, get_shorts_config
import click
import openai
import json
from datetime import datetime
from .ai_provider_cost_manager import _record_ai_provider_cost


def _important_segments(
    input_srt, output_file, segment_count, segment_duration_seconds, settings
):
    """Generates important segments from an SRT file using OpenAI API."""
    client = openai.OpenAI(
        api_key=settings.OPENAI_API_KEY,
        timeout=300.0,  # 5 minute timeout per request
        max_retries=2   # Retry up to 2 times on failure
    )

    try:
        with open(input_srt, 'r', encoding='utf-8') as f:
            srt_content = f.read()
    except FileNotFoundError:
        click.secho(
            f"Error: Input SRT file not found at {input_srt}", fg="red"
        )
        raise click.Abort()

    prompt = f"""
You are a video editor's assistant. Your task is to find interesting
segments from a podcast transcript to create short clips for social media.

Based on the provided SRT subtitle content, identify {segment_count}
interesting segments. Each segment should be approximately {segment_duration_seconds} seconds
in duration.

For each segment, provide:
1. `start`: The start time in `HH:MM:SS,ms` format from the SRT.
2. `end`: The end time in `HH:MM:SS,ms` format from the SRT.
3. `score`: An integer score from 0 to 100, where 100 is most interesting.
4. `why`: A brief justification for the score.
5. 'title': A title for the segment.
6. 'tags': A list of tags for the segmen, to spread the segment on social media, like instagram, facebook, twitter, etc.

Return the output as a single JSON object with a key "segments" that
contains a list of the identified segment objects.

Here is the SRT content:
```srt
{srt_content}
```
"""

    click.echo("Generating important segments with OpenAI API...")
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant designed to output JSON."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        )

        response_content = response.choices[0].message.content
        
        # Calculate cost for GPT-4-turbo
        # Input: $10/1M tokens, Output: $30/1M tokens
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        input_cost = (input_tokens / 1_000_000) * 10.0
        output_cost = (output_tokens / 1_000_000) * 30.0
        total_cost = input_cost + output_cost
        
        # Record the cost
        try:
            config = get_shorts_config()
            user_id = config.get_user_id()
            video_id = config.get_video_id()
            _record_ai_provider_cost(
                user_id=user_id,
                video_id=video_id,
                cost=f"{total_cost:.6f}",
                operation_name="important_segments_generation",
                provider="openai",
                model="gpt-4-turbo",
                usage=f"input:{input_tokens} tokens, output:{output_tokens} tokens",
                timestamp=datetime.utcnow().isoformat()
            )
        except Exception as e:
            click.secho(f"Warning: Failed to record AI cost: {e}", fg="yellow")

        # Validate and parse JSON
        try:
            segments_data = json.loads(response_content)
            segments_list = segments_data.get("segments", [])
        except (json.JSONDecodeError, AttributeError):
            click.secho(
                "Error: Failed to decode JSON from OpenAI API response.",
                fg="red",
            )
            click.secho(f"Raw response:\n{response_content}", fg="yellow")
            raise click.Abort()

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(segments_list, f, indent=4)

        click.secho(
            "Successfully generated important segments and saved to "
            f"{output_file}",
            fg="green"
        )

    except Exception as e:
        click.secho(f"An error occurred with the OpenAI API: {e}", fg="red")
        raise click.Abort()


@click.command('important-segments')
@click.option(
    '--input-srt',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the long video file."
)
@click.option(
    '--output-file',
    default='processed_podcast',
    show_default=True,
    type=click.Path(),
    help="Directory to save all processed files."
)
@click.option(
    '--segment-count',
    default=3,
    show_default=True,
    help="Target segment duration in minutes."
)

@click.option(
    '--segment-duration-seconds',
    default=60,
    show_default=True,
    help="Target segment duration in minutes."
)
@click.pass_context
def important_segments_command(
    ctx,
    input_srt,
    output_file,
    segment_count,
    segment_duration_seconds,
):
    settings = ctx.obj
    _important_segments(
        input_srt, output_file, segment_count, settings
    )
