import os
from jinja2 import Environment, FileSystemLoader
import sys

def generate_html_from_template(template_dir, template_name, output_filename, context):
    """
    Renders an HTML file from a Jinja2 template and saves it.

    Args:
        template_dir (str): The directory containing the template file.
        template_name (str): The name of the template file.
        output_filename (str): The name of the output HTML file (will be saved in /tmp).
        context (dict): A dictionary of variables to pass to the template.
    """
    if not os.path.isdir(template_dir):
        print(f"Error: Template directory '{template_dir}' not found or is not a directory.")
        return

    env = Environment(loader=FileSystemLoader(template_dir))
    
    try:
        template = env.get_template(template_name)
    except Exception as e:
        print(f"Error loading template '{template_name}' from '{template_dir}': {e}")
        return

    rendered_html = template.render(context)

    # Ensure output_filename is just the filename, not a path
    output_basename = os.path.basename(output_filename)
    output_path = os.path.join("/tmp", output_basename)

    try:
        with open(output_path, "w") as f:
            f.write(rendered_html)
        print(f"Successfully generated HTML file: {output_path}")
    except IOError as e:
        print(f"Error writing to file {output_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python render_email.py <path_to_template_file>")
        sys.exit(1)

    template_file_path = sys.argv[1]

    if not os.path.isfile(template_file_path):
        print(f"Error: Template file '{template_file_path}' not found or is not a file.")
        sys.exit(1)

    # Extract directory and filename from the provided path
    template_directory_arg = os.path.dirname(template_file_path)
    if not template_directory_arg:  # Handle case where only filename is given (assume current dir)
        template_directory_arg = "."
    template_filename_arg = os.path.basename(template_file_path)

    # --- Parameters to pass to the template ---
    document_id_param = "doc_12345xyz"
    signing_url_param = "https://example.com/sign"
    # --- End of Parameters ---

    # The output filename (will be placed in /tmp)
    output_html_file = f"rendered_email_{document_id_param}.html"

    template_context = {
        "document_id": document_id_param,
        "signing_callback_url": signing_url_param
    }

    generate_html_from_template(
        template_directory_arg,
        template_filename_arg,
        output_html_file,
        template_context
    )