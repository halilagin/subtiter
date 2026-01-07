import click
import re


def _srt_time_to_seconds(time_str):
    """Converts SRT time format HH:MM:SS,ms to seconds."""
    parts = re.split('[:,]', time_str)
    h, m, s, ms = map(int, parts)
    return h * 3600 + m * 60 + s + ms / 1000.0


@click.command('timestamp-to-seconds')
@click.option(
    '--timestamp',
    required=True,
    default="00:00:00,000",
    type=str,
    help="Timestamp to convert to seconds."
)
def timestamp_to_seconds(timestamp):
    seconds = _srt_time_to_seconds(timestamp)
    print(f"Timestamp: {timestamp} -> {seconds} seconds") 