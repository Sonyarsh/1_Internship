"""Общие зависимости FastAPI: текущий пользователь по JWT."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
import jwt

from database import get_session
from user_model import User

# Тот же секрет, что при выдаче токена в auth_router
SECRET_KEY = "concrete-lab-secret-change-me-32b"  # >= 32 байт для JWT HS256
ALGORITHM = "HS256"

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_session),
) -> User:
    """Без валидного Bearer-токена запрос получит 401."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", 0))
    except (jwt.PyJWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный или просроченный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Только для role=admin (на будущее)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ только для администратора",
        )
    return current_user
