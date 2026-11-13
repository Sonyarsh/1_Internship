from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_session
from deps import get_current_user
from notify_schemas import (
    ChannelStatus,
    NotifyConfigResponse,
    NotifySendRequest,
    NotifySendResponse,
    ProtocolLinkOrder,
    ProtocolLinkResponse,
)
from notify_service import notify_status, send_email, send_telegram
from protocol_lifecycle import (
    can_send_results,
    get_linked_order,
    get_protocol,
    require_can_send,
    validate_order_for_kind,
)
from user_model import User

router = APIRouter()


@router.get("/status", response_model=NotifyConfigResponse)
def get_notify_status(_user: User = Depends(get_current_user)):
    return notify_status()


@router.patch("/link-order", response_model=ProtocolLinkResponse)
def link_protocol_order(
    payload: ProtocolLinkOrder,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        item = get_protocol(db, payload.kind, payload.protocol_id, user_id=None)
    else:
        item = get_protocol(db, payload.kind, payload.protocol_id, user_id=current_user.id)

    order_id = validate_order_for_kind(db, payload.kind, payload.service_order_id)
    item.service_order_id = order_id
    db.add(item)
    db.commit()
    db.refresh(item)

    order = get_linked_order(db, item)
    return ProtocolLinkResponse(
        kind=payload.kind,
        protocol_id=item.id,
        service_order_id=item.service_order_id,
        order_status=order.status if order else None,
        order_payment_status=order.payment_status if order else None,
        order_title=order.service_title if order else None,
        can_send=can_send_results(order),
    )


@router.post("/send", response_model=NotifySendResponse)
def send_protocol_results(
    payload: NotifySendRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not payload.send_email and not payload.send_telegram:
        raise HTTPException(status_code=400, detail="Выберите email и/или Telegram")

    subject, body = _build_message(db, payload.kind, payload.protocol_id, current_user)

    channels: list[ChannelStatus] = []
    if payload.send_email:
        to_email = str(payload.email) if payload.email else current_user.email
        result = send_email(to_email, subject, body)
        channels.append(ChannelStatus(**result.__dict__))
    if payload.send_telegram:
        chat_id = (payload.telegram_chat_id or "").strip()
        result = send_telegram(chat_id, f"{subject}\n\n{body}")
        channels.append(ChannelStatus(**result.__dict__))

    return NotifySendResponse(
        subject=subject,
        channels=channels,
        any_ok=any(c.ok for c in channels),
    )


def _build_message(db: Session, kind: str, protocol_id: int, user: User) -> tuple[str, str]:
    item = get_protocol(db, kind, protocol_id, user_id=user.id)
    order = require_can_send(db, item)
    status_line = (
        f"Заявка №{order.id}: {order.service_title} — "
        f"работа={order.status}, оплата={order.payment_status}"
    )

    if kind == "compression":
        subject = f"БетонЛаб: сжатие #{item.id} — {item.concrete_class}"
        body = "\n".join(
            [
                "Протокол испытания на сжатие (ГОСТ 10180)",
                f"ID: {item.id}",
                status_line,
                f"Заявитель: {item.applicant_info}",
                f"Продукция: {item.product_id}",
                f"Класс бетона: {item.concrete_class}",
                f"Партия/образец/серия: {item.batch_N}/{item.sample_N}/{item.series_N}",
                f"fc: {item.fc_cube_batch_i_sample_j_series_k if item.fc_cube_batch_i_sample_j_series_k is not None else '—'} МПа",
                f"Пользователь: {user.name} <{user.email}>",
            ]
        )
        return subject, body

    if kind == "frost":
        subject = f"БетонЛаб: морозостойкость #{item.id} — {item.concrete_class}"
        body = "\n".join(
            [
                "Протокол морозостойкости (ГОСТ 10060)",
                f"ID: {item.id}",
                status_line,
                f"Заявитель: {item.applicant_info}",
                f"Класс бетона: {item.concrete_class}",
                f"Метод: {item.method}, среда: {item.exposure}",
                f"Проектная марка: F{item.project_mark}",
                f"Достигнутая марка: {item.achieved_mark or '—'}",
                f"Заключение: {item.conclusion or '—'}",
                f"Пользователь: {user.name} <{user.email}>",
            ]
        )
        return subject, body

    if kind == "waterproof":
        subject = f"БетонЛаб: водонепроницаемость #{item.id} — {item.concrete_class}"
        body = "\n".join(
            [
                "Протокол водонепроницаемости (ГОСТ 12730.5, мокрое пятно)",
                f"ID: {item.id}",
                status_line,
                f"Заявитель: {item.applicant_info}",
                f"Класс бетона: {item.concrete_class}",
                f"Режим: {item.mode}",
                f"Марка W: {item.achieved_mark or '—'}",
                f"Давление серии: {item.series_pressure_mpa if item.series_pressure_mpa is not None else '—'} МПа",
                f"Заключение: {item.conclusion or '—'}",
                f"Пользователь: {user.name} <{user.email}>",
            ]
        )
        return subject, body

    subject = f"БетонЛаб: сжатие в конструкциях #{item.id} — {item.concrete_class}"
    body = "\n".join(
        [
            "Протокол сжатия образцов из конструкций (ГОСТ 28570)",
            f"ID: {item.id}",
            status_line,
            f"Заявитель: {item.applicant_info}",
            f"Конструкция: {item.structure_name}",
            f"Класс бетона: {item.concrete_class}",
            f"Образцов: {item.samples_count if item.samples_count is not None else len(item.samples or [])}",
            f"Rср: {item.series_strength_mpa if item.series_strength_mpa is not None else '—'} МПа",
            f"Заключение: {item.conclusion or '—'}",
            f"Пользователь: {user.name} <{user.email}>",
        ]
    )
    return subject, body
