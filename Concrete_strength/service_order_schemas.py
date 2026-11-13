from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


ServiceKey = Literal["compression", "frost", "waterproof", "core"]
OrderStatus = Literal["new", "confirmed", "in_progress", "completed", "cancelled"]
PaymentStatus = Literal["unpaid", "invoiced", "paid"]


SERVICE_CATALOG: dict[str, dict] = {
    "compression": {
        "title": "Испытание на сжатие",
        "price_label": "от 50 BYN",
        "price_from_byn": 50,
        "norm": "ГОСТ 10180",
    },
    "frost": {
        "title": "Морозостойкость",
        "price_label": "от 120 BYN",
        "price_from_byn": 120,
        "norm": "ГОСТ 10060-2012",
    },
    "waterproof": {
        "title": "Водонепроницаемость",
        "price_label": "от 100 BYN",
        "price_from_byn": 100,
        "norm": "ГОСТ 12730.5-2018",
    },
    "core": {
        "title": "Испытание на сжатие в конструкциях",
        "price_label": "от 90 BYN",
        "price_from_byn": 90,
        "norm": "ГОСТ 28570-2019",
    },
}


class ServiceCatalogItem(BaseModel):
    key: str
    title: str
    price_label: str
    price_from_byn: int
    norm: str


class ServiceOrderCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr
    service_key: ServiceKey
    quantity: int = Field(default=1, ge=1, le=50)
    message: str | None = Field(default=None, max_length=1000)


class ServiceOrderUpdate(BaseModel):
    status: OrderStatus | None = None
    payment_status: PaymentStatus | None = None


class ServiceOrderResponse(BaseModel):
    id: int
    user_id: int | None = None
    name: str
    phone: str | None = None
    email: str
    service_key: str
    service_title: str
    price_label: str
    price_from_byn: int
    quantity: int
    message: str | None = None
    status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
