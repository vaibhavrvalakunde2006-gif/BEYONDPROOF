import sys
import os
from pathlib import Path
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from database.connection import Base, get_db
import database.models  # Register models
from auth.service import hash_password, create_access_token
from database.models import User
from main import app

# In-memory SQLite engine for tests
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database():
    """Create all database schema tables in the in-memory database."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    """Provide a transactional database session for each test."""
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def async_client(db_session: AsyncSession):
    """Provide an asynchronous HTTP test client with database dependency override."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a standard verified test user."""
    user = User(
        email="testuser@beyondproof.com",
        full_name="Standard Test User",
        hashed_password=hash_password("Password123!"),
        role="user",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create a verified administrator test user."""
    admin = User(
        email="admin@beyondproof.com",
        full_name="Admin User",
        hashed_password=hash_password("AdminSecret123!"),
        role="admin",
        is_active=True,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture
def auth_headers(test_user: User) -> dict:
    """Generate authorization headers for standard test user."""
    token = create_access_token(
        data={"sub": test_user.id, "email": test_user.email, "role": test_user.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
def admin_headers(admin_user: User) -> dict:
    """Generate authorization headers for administrator user."""
    token = create_access_token(
        data={"sub": admin_user.id, "email": admin_user.email, "role": admin_user.role}
    )
    return {"Authorization": f"Bearer {token}"}
