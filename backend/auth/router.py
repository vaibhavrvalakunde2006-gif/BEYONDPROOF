from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import User
from auth.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserUpdateRequest,
    UserResponse,
    TokenResponse,
)
from auth.service import (
    register_user,
    authenticate_user,
    create_access_token,
    update_user_profile,
    hash_password,
)
from auth.dependencies import get_current_active_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account and return an access token."""
    user = await register_user(db, user_in)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    user_in: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate an existing user and return an access token."""
    user = await authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently disabled.",
        )

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/judge-pass", response_model=TokenResponse)
async def judge_pass(
    db: AsyncSession = Depends(get_db),
):
    """Instant 1-click investigator authorization for judges and evaluators."""
    query = select(User).where(User.email == "demo@beyondproof.dev")
    res = await db.execute(query)
    user = res.scalar_one_or_none()
    if not user:
        query_admin = select(User).where(User.email == "admin@beyondproof.dev")
        res_admin = await db.execute(query_admin)
        user = res_admin.scalar_one_or_none()

    if not user:
        user = User(
            email="demo@beyondproof.dev",
            full_name="Lead Forensic Investigator",
            hashed_password=hash_password("DemoPass2026!"),
            role="admin",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve profile details for the authenticated user."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile attributes (name, password) for the authenticated user."""
    updated = await update_user_profile(db, current_user, update_data)
    return UserResponse.model_validate(updated)
