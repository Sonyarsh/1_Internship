from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import waterproof_model
import waterproof_schemas
from database import get_session
from deps import get_current_user
from protocol_lifecycle import validate_order_for_kind
from user_model import User
from waterproof_calc import catalog, evaluate

router = APIRouter()


def _owned(db: Session, item_id: int, user: User) -> waterproof_model.WaterproofTest:
    item = (
        db.query(waterproof_model.WaterproofTest)
        .filter(
            waterproof_model.WaterproofTest.id == item_id,
            waterproof_model.WaterproofTest.user_id == user.id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Протокол не найден")
    return item


def _fill(item: waterproof_model.WaterproofTest, data: waterproof_schemas.WaterproofCreate) -> None:
    payload = data.model_dump()
    for key, value in payload.items():
        setattr(item, key, value)
    try:
        result = evaluate(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    for key, value in result.items():
        setattr(item, key, value)


@router.get("/catalog")
def waterproof_catalog(_user: User = Depends(get_current_user)):
    return catalog()


@router.post("/", response_model=waterproof_schemas.WaterproofResponse, status_code=201)
def create_waterproof(
    data: waterproof_schemas.WaterproofCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = waterproof_model.WaterproofTest(user_id=current_user.id)
    _fill(item, data)
    item.service_order_id = validate_order_for_kind(db, "waterproof", data.service_order_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/", response_model=list[waterproof_schemas.WaterproofResponse])
def list_waterproof(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(waterproof_model.WaterproofTest)
        .filter(waterproof_model.WaterproofTest.user_id == current_user.id)
        .order_by(waterproof_model.WaterproofTest.id.desc())
        .all()
    )


@router.get("/{item_id}", response_model=waterproof_schemas.WaterproofResponse)
def get_waterproof(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return _owned(db, item_id, current_user)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_waterproof(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = _owned(db, item_id, current_user)
    db.delete(item)
    db.commit()
    return None
