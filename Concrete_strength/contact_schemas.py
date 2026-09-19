from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ContactRequestCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Иван Петров"])
    phone: Optional[str] = Field(None, max_length=40, examples=["+375 44 777 88 99"])
    email: EmailStr = Field(..., examples=["ivan@example.com"])
    service_type: Optional[str] = Field(
        None,
        max_length=80,
        examples=["Испытания прочности"],
    )
    message: str = Field(
        ...,
        min_length=5,
        max_length=1000,
        examples=["Нужно испытать кубы бетона класса C25/30."],
    )


class ContactRequestResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    email: str
    service_type: Optional[str] = None
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}
