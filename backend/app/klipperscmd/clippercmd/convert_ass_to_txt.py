import re
import click

def _ass_to_string(ass_file_path):
    """
    Reads an ASS subtitle file, extracts the dialogue, removes formatting tags,
    and returns the plain text content.
    """
    full_text = []
    try:
        with open(ass_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip().startswith('Dialogue:'):
                    # The format is: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
                    # The text is everything after the 9th comma.
                    parts = line.split(',', 9)
                    if len(parts) == 10:
                        text_with_tags = parts[9].strip()
                        # Remove ASS tags like {\k63}, {\i1}, etc.
                        clean_text = re.sub(r'\{[^}]+\}', '', text_with_tags)
                        # ASS files can use \N for newlines within a single dialogue line.
                        clean_text = clean_text.replace('\\N', ' ')
                        full_text.append(clean_text)
    except FileNotFoundError:
        return f"Error: File not found at {ass_file_path}"
    except Exception as e:
        return f"An error occurred: {e}"

    return ' '.join(full_text)


@click.command('convert-ass-to-txt')
@click.option(
    '--ass-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the ASS file to convert."
)
@click.option(
    '--output-file',
    required=False,
    type=click.Path(),
    help="Output text file path."
)
def convert_ass_to_txt_command(ass_file, output_file):
    _convert_ass_to_txt(ass_file, output_file)

def _convert_ass_to_txt(ass_file, output_file):
    """Converts an ASS file to a text file containing only the text."""
    plain_text = _ass_to_string(ass_file)
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(plain_text)
    else:
        print(plain_text)
