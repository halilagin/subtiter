# clipper/clippercmd/format_time.py
from datetime import timedelta


def _format_time_for_srt(seconds):
    """Converts seconds to SRT time format HH:MM:SS,ms."""
    delta = timedelta(seconds=seconds)
    hours, remainder = divmod(delta.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    milliseconds = delta.microseconds // 1000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}" 