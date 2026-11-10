from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import core_model
import frost_model
import models
import waterproof_model
from database import get_session
from deps import get_current_user
from notify_schemas import NotifyConfigResponse, NotifySendRequest, NotifySendResponse, ChannelStatus
from notify_service import notify_status, send_email, send_telegram
from user_model import User

router = APIRouter()


@router.get("/status", response_model=NotifyConfigResponse)
def get_notify_status(_user: User = Depends(get_current_user)):
    return notify_status()


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


def _owned_or_404(item, label: str):
    if item is None:
        raise HTTPException(status_code=404, detail=f"{label} не найден")
    return item


def _build_message(db: Session, kind: str, protocol_id: int, user: User) -> tuple[str, str]:
    if kind == "compression":
        item = _owned_or_404(
            db.query(models.ConcreteStrength)
            .filter(models.ConcreteStrength.id == protocol_id, models.ConcreteStrength.user_id == user.id)
            .first(),
            "Протокол сжатия",
        )
        subject = f"БетонЛаб: сжатие #{item.id} — {item.concrete_class}"
        body = "\n".join(
            [
                "Протокол испытания на сжатие (ГОСТ 10180)",
                f"ID: {item.id}",
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
        item = _owned_or_404(
            db.query(frost_model.FrostTest)
            .filter(frost_model.FrostTest.id == protocol_id, frost_model.FrostTest.user_id == user.id)
            .first(),
            "Протокол морозостойкости",
        )
        subject = f"БетонЛаб: морозостойкость #{item.id} — {item.concrete_class}"
        body = "\n".join(
            [
                "Протокол морозостойкости (ГОСТ 10060)",
                f"ID: {item.id}",
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
        item = _owned_or_404(
            db.query(waterproof_model.WaterproofTest)
            .filter(
                waterproof_model.WaterproofTest.id == protocol_id,
                waterproof_model.WaterproofTest.user_id == user.id,
            )
            .first(),
            "Протокол водонепроницаемости",
        )
        subject = f"БетонЛаб: водонепроницаемость #{item.id} — {item.concrete_class}"
        body = "\n".join(
            [
                "Протокол водонепроницаемости (ГОСТ 12730.5, мокрое пятно)",
                f"ID: {item.id}",
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

    if kind == "core":
        item = _owned_or_404(
            db.query(core_model.CoreStrengthTest)
            .filter(
                core_model.CoreStrengthTest.id == protocol_id,
                core_model.CoreStrengthTest.user_id == user.id,
            )
            .first(),
            "Протокол сжатия в конструкциях",
        )
        subject = f"БетонЛаб: сжатие в конструкциях #{item.id} — {item.concrete_class}"
        body = "\n".join(
            [
                "Протокол сжатия образцов из конструкций (ГОСТ 28570)",
                f"ID: {item.id}",
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

    raise HTTPException(status_code=400, detail="Неизвестный тип протокола")
