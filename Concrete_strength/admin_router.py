from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

import contact_model
import core_model
import frost_model
import models
import service_order_model
import waterproof_model
from auth_schemas import UserResponse
from database import get_session
from deps import require_admin
from user_model import User

router = APIRouter()


class AdminSummary(BaseModel):
    users_total: int
    admins_total: int
    contact_requests: int
    service_orders_total: int
    service_orders_new: int
    service_orders_unpaid: int
    protocols_compression: int
    protocols_frost: int
    protocols_waterproof: int
    protocols_core: int


class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(user|admin)$")


@router.get("/summary", response_model=AdminSummary)
def admin_summary(
    db: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    users_total = db.query(func.count(User.id)).scalar() or 0
    admins_total = (
        db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0
    )
    contact_requests = (
        db.query(func.count(contact_model.ContactRequest.id)).scalar() or 0
    )
    so = service_order_model.ServiceOrder
    service_orders_total = db.query(func.count(so.id)).scalar() or 0
    service_orders_new = (
        db.query(func.count(so.id)).filter(so.status == "new").scalar() or 0
    )
    service_orders_unpaid = (
        db.query(func.count(so.id)).filter(so.payment_status == "unpaid").scalar() or 0
    )
    return AdminSummary(
        users_total=users_total,
        admins_total=admins_total,
        contact_requests=contact_requests,
        service_orders_total=service_orders_total,
        service_orders_new=service_orders_new,
        service_orders_unpaid=service_orders_unpaid,
        protocols_compression=db.query(func.count(models.ConcreteStrength.id)).scalar()
        or 0,
        protocols_frost=db.query(func.count(frost_model.FrostTest.id)).scalar() or 0,
        protocols_waterproof=db.query(func.count(waterproof_model.WaterproofTest.id)).scalar()
        or 0,
        protocols_core=db.query(func.count(core_model.CoreStrengthTest.id)).scalar() or 0,
    )


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    return db.query(User).order_by(User.id.asc()).all()


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.id == admin.id and payload.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="Нельзя снять роль admin у самого себя",
        )

    if user.role == "admin" and payload.role == "user":
        admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0
        if admins <= 1:
            raise HTTPException(
                status_code=400,
                detail="Должен остаться хотя бы один администратор",
            )

    user.role = payload.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")

    if user.role == "admin":
        admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0
        if admins <= 1:
            raise HTTPException(
                status_code=400,
                detail="Должен остаться хотя бы один администратор",
            )

    # Протоколы и заказы оставляем: user_id обнуляем, данные не теряются
    for model in (
        models.ConcreteStrength,
        frost_model.FrostTest,
        waterproof_model.WaterproofTest,
        core_model.CoreStrengthTest,
        service_order_model.ServiceOrder,
    ):
        db.query(model).filter(model.user_id == user_id).update(
            {model.user_id: None},
            synchronize_session=False,
        )

    db.delete(user)
    db.commit()
    return None
