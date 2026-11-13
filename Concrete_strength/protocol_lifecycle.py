"""Связь протокол ↔ заявка: отправка только если заявка выполнена и оплачена."""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

import core_model
import frost_model
import models
import service_order_model
import waterproof_model

KIND_TO_SERVICE_KEY = {
    "compression": "compression",
    "frost": "frost",
    "waterproof": "waterproof",
    "core": "core",
}

PROTOCOL_MODELS = {
    "compression": (models.ConcreteStrength, "Протокол сжатия"),
    "frost": (frost_model.FrostTest, "Протокол морозостойкости"),
    "waterproof": (waterproof_model.WaterproofTest, "Протокол водонепроницаемости"),
    "core": (core_model.CoreStrengthTest, "Протокол сжатия в конструкциях"),
}


def get_protocol(db: Session, kind: str, protocol_id: int, user_id: int | None = None):
    if kind not in PROTOCOL_MODELS:
        raise HTTPException(status_code=400, detail="Неизвестный тип протокола")
    model, label = PROTOCOL_MODELS[kind]
    q = db.query(model).filter(model.id == protocol_id)
    if user_id is not None:
        q = q.filter(model.user_id == user_id)
    item = q.first()
    if item is None:
        raise HTTPException(status_code=404, detail=f"{label} не найден")
    return item


def get_linked_order(db: Session, item: Any) -> service_order_model.ServiceOrder | None:
    order_id = getattr(item, "service_order_id", None)
    if not order_id:
        return None
    return (
        db.query(service_order_model.ServiceOrder)
        .filter(service_order_model.ServiceOrder.id == order_id)
        .first()
    )


def can_send_results(order: service_order_model.ServiceOrder | None) -> bool:
    if order is None:
        return False
    return order.status == "completed" and order.payment_status == "paid"


def require_can_send(db: Session, item: Any) -> service_order_model.ServiceOrder:
    order = get_linked_order(db, item)
    if order is None:
        raise HTTPException(
            status_code=400,
            detail="Протокол не привязан к заявке. Сначала выберите заявку на услугу.",
        )
    if not can_send_results(order):
        raise HTTPException(
            status_code=400,
            detail=(
                "Отправка доступна только когда заявка в статусах "
                f"'выполнена' и 'оплачена'. Сейчас: работа={order.status}, "
                f"оплата={order.payment_status}."
            ),
        )
    return order


def validate_order_for_kind(
    db: Session,
    kind: str,
    service_order_id: int | None,
) -> int | None:
    if service_order_id is None:
        return None
    expected = KIND_TO_SERVICE_KEY.get(kind)
    order = (
        db.query(service_order_model.ServiceOrder)
        .filter(service_order_model.ServiceOrder.id == service_order_id)
        .first()
    )
    if order is None:
        raise HTTPException(status_code=400, detail="Заявка не найдена")
    if expected and order.service_key != expected:
        raise HTTPException(
            status_code=400,
            detail=f"Заявка №{order.id} другой услуги ({order.service_title})",
        )
    return order.id
