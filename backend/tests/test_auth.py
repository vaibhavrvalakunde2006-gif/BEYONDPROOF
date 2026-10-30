import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user_success(async_client: AsyncClient):
    """Verify that a new user can register successfully and receives an access token."""
    payload = {
        "email": "newuser@beyondproof.com",
        "password": "SecurePassword123!",
        "full_name": "New Platform User",
    }
    response = await async_client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@beyondproof.com"
    assert data["user"]["full_name"] == "New Platform User"


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient, test_user):
    """Verify that registering with an already existing email returns 400 Bad Request."""
    payload = {
        "email": test_user.email,
        "password": "AnotherPassword123!",
        "full_name": "Duplicate User",
    }
    response = await async_client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, test_user):
    """Verify that a registered user can login with valid credentials."""
    payload = {
        "email": test_user.email,
        "password": "Password123!",
    }
    response = await async_client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["id"] == test_user.id


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient, test_user):
    """Verify that login fails with 401 when an incorrect password is provided."""
    payload = {
        "email": test_user.email,
        "password": "WrongPassword!",
    }
    response = await async_client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_profile_with_token(async_client: AsyncClient, test_user, auth_headers):
    """Verify that an authenticated user can retrieve their profile details."""
    response = await async_client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email


@pytest.mark.asyncio
async def test_get_profile_without_token(async_client: AsyncClient):
    """Verify that requesting the profile without an Authorization header returns 401."""
    response = await async_client.get("/api/auth/me")
    assert response.status_code == 401
