from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
import jwt

from database import get_session
from user_model import User
from auth_schemas import UserCreate, UserResponse, UserLogin, TokenResponse
from deps import SECRET_KEY, ALGORITHM, get_current_user

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 часа


def hash_password(password: str) -> str:
    """Хешируем пароль — в БД храним только хеш, не открытый текст."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Сверяем введённый пароль с хешем из БД."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    """JWT: внутри кладём id пользователя и срок действия."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация нового пользователя",
)
def register(data: UserCreate, db: Session = Depends(get_session)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже зарегистрирован",
        )

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Вход: проверка пароля и выдача JWT",
)
def login(data: UserLogin, db: Session = Depends(get_session)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Текущий пользователь по токену",
)
def me(current_user: User = Depends(get_current_user)):
    return current_user
