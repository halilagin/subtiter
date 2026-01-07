#!/usr/bin/env python3
"""
Replace all instances of 'klippers' with 'subtiter' in all files,
respecting case sensitivity.
"""
import os
import re
from pathlib import Path


def replace_case_sensitive(text, old_word, new_word):
    """
    Replace old_word with new_word while preserving case patterns.

    Examples:
    - klippers -> subtiter
    - Klippers -> Subtiter
    - KLIPPERS -> SUBTITER
    - KLiPPERS -> SUbTITER (preserves exact case pattern)
    """
    def replace_match(match):
        matched_text = match.group(0)

        # All uppercase
        if matched_text.isupper():
            return new_word.upper()
        # All lowercase
        elif matched_text.islower():
            return new_word.lower()
        # Title case (first letter uppercase)
        elif matched_text[0].isupper() and matched_text[1:].islower():
            return new_word.capitalize()
        # Mixed case - try to preserve the pattern
        else:
            result = []
            for i, char in enumerate(new_word):
                if i < len(matched_text):
                    if matched_text[i].isupper():
                        result.append(char.upper())
                    else:
                        result.append(char.lower())
                else:
                    result.append(char)
            return ''.join(result)

    # Create case-insensitive pattern
    pattern = re.compile(re.escape(old_word), re.IGNORECASE)
    return pattern.sub(replace_match, text)


def should_skip_file(file_path):
    """Check if file should be skipped."""
    skip_dirs = {
        '.git', 'node_modules', '__pycache__', '.pytest_cache',
        'venv', 'env', '.venv', 'dist', 'build', '.next'
    }

    # Check if any parent directory should be skipped
    parts = Path(file_path).parts
    if any(skip_dir in parts for skip_dir in skip_dirs):
        return True

    # Skip binary files and this script itself
    skip_patterns = {
        '.pyc', '.so', '.dylib', '.png', '.jpg', '.jpeg', '.gif',
        '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot',
        '.mp4', '.avi', '.mov', '.mp3', '.wav',
        '.zip', '.tar', '.gz', '.pdf',
        'replace_klippers.py'
    }

    return any(str(file_path).endswith(pattern) for pattern in skip_patterns)


def process_file(file_path, old_word, new_word, dry_run=False):
    """Process a single file and replace occurrences."""
    try:
        # Try to read as text file
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Replace while preserving case
        new_content = replace_case_sensitive(content, old_word, new_word)

        # Check if any changes were made
        if content != new_content:
            if dry_run:
                # Count occurrences
                pattern = re.compile(re.escape(old_word), re.IGNORECASE)
                count = len(pattern.findall(content))
                print(f"Would update {file_path} ({count} occurrences)")
            else:
                # Write changes
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                # Count occurrences
                pattern = re.compile(re.escape(old_word), re.IGNORECASE)
                count = len(pattern.findall(content))
                print(f"Updated {file_path} ({count} occurrences)")

            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False


def main():
    """Main function to process all files."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Replace klippers with subtiter in all files'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without making changes'
    )
    parser.add_argument(
        '--root',
        default='.',
        help='Root directory to search (default: current directory)'
    )

    args = parser.parse_args()

    old_word = 'klippers'
    new_word = 'subtiter'

    root_path = Path(args.root).resolve()
    print(f"Searching for '{old_word}' in {root_path}")
    print(f"Will replace with '{new_word}' (preserving case)")

    if args.dry_run:
        print("\n*** DRY RUN MODE - No changes will be made ***\n")

    files_changed = 0
    files_processed = 0

    # Walk through all files
    for root, dirs, files in os.walk(root_path):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in {
            'node_modules', '__pycache__', 'venv', 'env', '.venv',
            'dist', 'build', '.next', '.pytest_cache'
        }]

        for file in files:
            file_path = Path(root) / file

            # Skip files we shouldn't process
            if should_skip_file(file_path):
                continue

            files_processed += 1

            # Process the file
            if process_file(file_path, old_word, new_word, args.dry_run):
                files_changed += 1

    print(f"\n{'Would process' if args.dry_run else 'Processed'} {files_processed} files")
    print(f"{'Would update' if args.dry_run else 'Updated'} {files_changed} files")

    if args.dry_run:
        print("\nTo apply changes, run without --dry-run flag")


if __name__ == '__main__':
    main()
