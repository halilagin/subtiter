# flake8: noqa: E501
#!/usr/bin/env python3
"""
Simple Click CLI example for klippers cmd_client
"""

import click
import os
from datetime import datetime


@click.group()
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
@click.pass_context
def cli(ctx, verbose):
    """Klippers Command Line Client - A simple CLI example"""
    ctx.ensure_object(dict)
    ctx.obj['verbose'] = verbose
    if verbose:
        click.echo("Verbose mode enabled")


@cli.command()
@click.option('--name', '-n', default='World', help='Name to greet')
@click.option('--count', '-c', default=1, help='Number of times to greet')
@click.pass_context
def hello(ctx, name, count):
    """Simple greeting command"""
    for i in range(count):
        message = f"Hello, {name}!"
        if ctx.obj['verbose']:
            timestamp = datetime.now().strftime('%H:%M:%S')
            message += f" (greeting #{i+1} at {timestamp})"
        click.echo(message)


@cli.command()
@click.argument('filename', type=click.Path())
@click.pass_context
def process_file(ctx, filename, output, format):
    """Process a file with various options"""
    if ctx.obj['verbose']:
        click.echo(f"Processing file: {filename}")
        click.echo(f"Output format: {format}")
        
    if not os.path.exists(filename):
        click.echo(f"Error: File '{filename}' not found", err=True)
        return
    
    print(f"Processing file: {filename}")




if __name__ == '__main__':
    cli()


