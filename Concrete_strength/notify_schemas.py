from typing import Literal

from pydantic import BaseModel, EmailStr, Field


ProtocolKind = Literal["compression", "frost", "waterproof", "core"]


class NotifySendRequest(BaseModel):
    kind: ProtocolKind
    protocol_id: int = Field(..., gt=0)
    send_email: bool = True
    send_telegram: bool = True
    email: EmailStr | None = None
    telegram_chat_id: str | None = Field(default=None, max_length=64)


class ProtocolLinkOrder(BaseModel):
    kind: ProtocolKind
    protocol_id: int = Field(..., gt=0)
    service_order_id: int | None = None


class ProtocolLinkResponse(BaseModel):
    kind: ProtocolKind
    protocol_id: int
    service_order_id: int | None
    order_status: str | None = None
    order_payment_status: str | None = None
    order_title: str | None = None
    can_send: bool


class ChannelStatus(BaseModel):
    channel: str
    ok: bool
    detail: str


class NotifySendResponse(BaseModel):
    subject: str
    channels: list[ChannelStatus]
    any_ok: bool


class NotifyConfigResponse(BaseModel):
    dry_run: bool
    email_configured: bool
    telegram_configured: bool
    default_telegram_chat_id: str | None = None
    smtp_host: str | None = None
    smtp_from: str | None = None
