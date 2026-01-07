from sqlalchemy import create_engine, inspect, text
from app.db.model_document import Base as DocumentBase
import os
from dotenv import load_dotenv
import click

"""

python -m app.init.dbmanager --help

"""

# Load environment variables from .env file
load_dotenv()

def env_db_url():
    return os.getenv("DATABASE_URL", "sqlite:///app.db")

def create_tables(engine):
    """
    Initialize the database by creating all tables defined in the Base metadata.

    Args:
        db_url (str, optional): Database connection URL (e.g., 'sqlite:///app.db').
                               If None, reads from DATABASE_URL environment variable.

    Returns:
        engine: SQLAlchemy engine instance
    """

    DocumentBase.metadata.create_all(engine)
    return engine

def drop_tables(engine):
    """
    Reset the database by dropping all tables and recreating them.

    Args:
        engine: SQLAlchemy engine instance
    """
    DocumentBase.metadata.drop_all(engine)

def drop_and_create_tables(engine):
    """
    Reset the database by dropping all tables and recreating them.

    Args:
        engine: SQLAlchemy engine instance
    """
    drop_tables(engine)
    create_tables(engine)


def list_tables(engine):
    """
    Reset the database by dropping all tables and recreating them.

    Args:
        engine: SQLAlchemy engine instance
    """
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    click.echo(f"Tables in the database: {table_names}")


def seed_database(engine):
    """
    Seed the database with initial data.

    Args:
        engine: SQLAlchemy engine instance
    """
    from app.db.seed import seed_database
    seed_database()



def apply_promotion_codes_with_text(engine, text, count):
    """
    Seed the database with initial data.

    Args:
        engine: SQLAlchemy engine instance
    """
    from app.db.seed import apply_promotion_codes_with_text as seed_apply_promotion_codes_with_text
    seed_apply_promotion_codes_with_text(engine, text, count)

def apply_promotion_codes(engine):
    """
    Seed the database with initial data.

    Args:
        engine: SQLAlchemy engine instance
    """
    from app.db.seed import apply_promotion_codes
    apply_promotion_codes(engine)

def sql(engine, query):
    """
    Execute a raw SQL query on the database.

    Args:
        engine: SQLAlchemy engine instance
        query: SQL query string to execute
    """
    with engine.connect() as connection:
        result = connection.execute(text(query))
        return result.fetchall()

@click.group()
def cli():
    """Database management commands."""
    pass

@cli.command('init')
def cmd_create_tables(db_url=None):
    """Initialize the database tables."""
    engine = create_engine(env_db_url())
    create_tables(engine)
    click.echo(f"Database initialized at {env_db_url()}")

@cli.command('droptables')
@click.confirmation_option(prompt='Are you sure you want to reset the database?')
def cmd_drop_tables():
    """Reset the database (drops and recreates all tables)."""
    engine = create_engine(env_db_url())
    drop_tables(engine)
    click.echo(f"Database reset at {env_db_url()}")

@cli.command('reinitialize')
# @click.confirmation_option(prompt='Are you sure you want to reset the database?')
def cmd_reinitialize():
    """Reset the database (drops and recreates all tables)."""
    engine = create_engine(env_db_url())
    drop_tables(engine)
    create_tables(engine)
    click.echo(f"Database reset at {env_db_url()}")

@cli.command('listtables')
def cmd_list_tables():
    """List all tables in the database."""
    engine = create_engine(env_db_url())
    list_tables(engine)

@cli.command('seed')
def cmd_seed():
    """Seed the database with initial data."""
    engine = create_engine(env_db_url())
    seed_database(engine)

@cli.command('generate-promotion-codes')
def cmd_apply_promotion_codes():
    """Apply promotion codes to the database."""
    engine = create_engine(env_db_url())
    apply_promotion_codes(engine)


@cli.command('generate-promotion-codes-with-text')
@click.argument('text', required=True)
@click.argument('count', required=True, type=int)
def cmd_generate_promotion_codes_with_text(text, count):
    """Apply promotion codes to the database."""
    engine = create_engine(env_db_url())
    apply_promotion_codes_with_text(engine, text, count)

@cli.command('sql')
@click.argument('query', required=True)
def cmd_sql(query):
    """Execute a raw SQL query and display results as a table."""
    engine = create_engine(env_db_url())
    results = sql(engine, query)

    if not results:
        click.echo("Query returned no results.")
        return

    # Get column names from first result
    if hasattr(results[0], '_fields'):
        headers = results[0]._fields
    else:
        headers = [f"Column {i + 1}" for i in range(len(results[0]))]

    # Format as table
    # Calculate column widths
    col_widths = [max(len(str(row[i])) for row in results + [headers]) for i in range(len(headers))]

    # Print header
    header_row = " | ".join(f"{headers[i]:{col_widths[i]}}" for i in range(len(headers)))
    click.echo(header_row)
    click.echo("-" * len(header_row))

    # Print data rows
    for row in results:
        click.echo(" | ".join(f"{str(row[i]):{col_widths[i]}}" for i in range(len(row))))

if __name__ == "__main__":
    cli()
