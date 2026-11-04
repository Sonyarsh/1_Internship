import re

from pydantic import BaseModel, EmailStr, Field, field_validator


def normalize_phone(value: str) -> str:
    """Международный номер: + и 8–15 цифр, без пробелов и скобок."""
    phone = re.sub(r"[\s\-()]", "", value.strip())
    if not re.fullmatch(r"\+[1-9]\d{7,14}", phone):
        raise ValueError(
            "Телефон в международном формате, например +375291234567"
        )
    return phone


class UserCreate(BaseModel):
    """Тело запроса POST /auth/register."""

    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=30)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return normalize_phone(v)


class UserLogin(BaseModel):
    """Тело запроса POST /auth/login."""

    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    """Ответ API без пароля."""

    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Ответ login: токен + пользователь."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    """Обновление профиля: имя и телефон."""

    name: str = Field(..., min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None or not str(v).strip():
            return None
        return normalize_phone(v)


class PasswordChange(BaseModel):
    """Смена пароля."""

    current_password: str = Field(..., min_length=6, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)
