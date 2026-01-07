from fastapi.testclient import TestClient
import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.model_document import Base, User
from app.main import app

@pytest.fixture(scope="function")
def engine():
    return create_engine('sqlite:///:memory:')

@pytest.fixture(scope="function")
def tables(engine):
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture(scope="function")
def db_session(engine, tables):
    """Returns a SQLAlchemy session, and after the test tears down everything properly."""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def sample_user():
    user = User(
        id="8c8ef5c7-f30e-44c4-a370-2011b837988d",
        email="halil.agin+test@gmail.com",
        username="halilagintest",
        hashed_password="123456",
        is_active=True,
        subscription_id="sub_1RVEu3Gg0tCTvsYGY9Kh23RF",
        subscription_plan="VOLUME_BASED_PAYMENT",
        subscription_created_at=datetime.now(timezone.utc),
        subscription_updated_at=datetime.now(timezone.utc),
        subscription_expires_at=datetime.now(timezone.utc) + timedelta(days=365),
    )
    return user








@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers():
    # Login to get access token
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "halil.agin+test@gmail.com", "password": "123456"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


