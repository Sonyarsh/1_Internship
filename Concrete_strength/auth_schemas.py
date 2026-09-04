from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Тело запроса POST /auth/register."""

    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    """Тело запроса POST /auth/login."""

    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    """Ответ API без пароля."""

    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Ответ login: токен + пользователь."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
