from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

import service_order_model
from database import get_session
from deps import get_current_user, require_admin
from service_order_schemas import (
    SERVICE_CATALOG,
    ServiceCatalogItem,
    ServiceOrderCreate,
    ServiceOrderResponse,
    ServiceOrderUpdate,
)
from user_model import User

router = APIRouter()
optional_bearer = HTTPBearer(auto_error=False)


def _optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_session),
) -> User | None:
    if credentials is None:
        return None
    try:
        # Переиспользуем логику get_current_user через ручной вызов зависимостей нельзя —
        # декодируем так же, как deps.
        from deps import ALGORITHM, SECRET_KEY
        import jwt

        token = credentials.credentials.strip()
        if token.lower().startswith("bearer "):
            token = token[7:].strip()
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_sub": False},
        )
        user_id = int(payload["sub"])
        return db.query(User).filter(User.id == user_id).first()
    except Exception:  # noqa: BLE001 — гостевой заказ без пользователя
        return None


@router.get("/catalog", response_model=list[ServiceCatalogItem])
def catalog():
    return [
        ServiceCatalogItem(key=key, **meta) for key, meta in SERVICE_CATALOG.items()
    ]


@router.post("/", response_model=ServiceOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: ServiceOrderCreate,
    db: Session = Depends(get_session),
    user: User | None = Depends(_optional_user),
):
    meta = SERVICE_CATALOG.get(payload.service_key)
    if meta is None:
        raise HTTPException(status_code=400, detail="Неизвестная услуга")

    row = service_order_model.ServiceOrder(
        user_id=user.id if user else None,
        name=payload.name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        email=str(payload.email).strip().lower(),
        service_key=payload.service_key,
        service_title=meta["title"],
        price_label=meta["price_label"],
        price_from_byn=meta["price_from_byn"],
        quantity=payload.quantity,
        message=payload.message.strip() if payload.message else None,
        status="new",
        payment_status="unpaid",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/mine", response_model=list[ServiceOrderResponse])
def my_orders(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(service_order_model.ServiceOrder)
        .filter(
            (service_order_model.ServiceOrder.user_id == current_user.id)
            | (service_order_model.ServiceOrder.email == current_user.email.lower())
        )
        .order_by(service_order_model.ServiceOrder.id.desc())
        .all()
    )


@router.get("/", response_model=list[ServiceOrderResponse])
def list_orders(
    db: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    return (
        db.query(service_order_model.ServiceOrder)
        .order_by(service_order_model.ServiceOrder.id.desc())
        .all()
    )


@router.patch("/{order_id}", response_model=ServiceOrderResponse)
def update_order(
    order_id: int,
    payload: ServiceOrderUpdate,
    db: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    row = (
        db.query(service_order_model.ServiceOrder)
        .filter(service_order_model.ServiceOrder.id == order_id)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    if payload.status is not None:
        row.status = payload.status
    if payload.payment_status is not None:
        row.payment_status = payload.payment_status
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row
