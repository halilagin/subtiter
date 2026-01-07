from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import sqlalchemy

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()
Base = sqlalchemy.orm.declarative_base()


def get_db():
    print("halil:debug:get_db:dburl:", settings.DATABASE_URL)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
