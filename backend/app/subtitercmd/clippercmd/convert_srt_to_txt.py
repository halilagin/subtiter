# flake8: noqa: E501
import click
import re
from config import Settings

def _convert_srt_to_txt(srt_file, txt_file=None):
    """Converts an SRT file to a text file containing only the text."""
    output_txt_file = txt_file or srt_file.replace('.srt', '.txt')
    with open(srt_file, 'r', encoding='utf-8') as f:
        srt_content = f.read()

    # Parse the SRT content and extract only text
    text_list = []
    srt_blocks = srt_content.strip().split('\n\n')
    for block in srt_blocks:
        if not block.strip():
            continue
        lines = block.strip().split('\n')
        # Skip subtitle number (line 0) and timestamp (line 1)
        # Text starts from line 2 and can span multiple lines
        if len(lines) >= 3:
            text_lines = lines[2:]  # All lines after timestamp
            text = ' '.join(text_lines)  # Join multi-line text
            if text.strip():  # Only add non-empty text
                text_list.append(text.strip())

    text_content = "\n".join(text_list)
    with open(output_txt_file, 'w', encoding='utf-8') as f:
        f.write(text_content)


@click.command('convert-srt-to-txt')
@click.argument('srt_file', type=click.Path(exists=True))
@click.option(
    '--txt-file',
    required=False,
    type=click.Path(),
    help="Output text file path."
)
def convert_srt_to_txt_command(srt_file, txt_file):
    """Converts an SRT file to a text file containing only the text."""
    _convert_srt_to_txt(srt_file, txt_file) 