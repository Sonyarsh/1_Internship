from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import core_model
import core_schemas
from core_calc import catalog, evaluate
from database import get_session
from deps import get_current_user
from user_model import User

router = APIRouter()


def _owned(db: Session, item_id: int, user: User) -> core_model.CoreStrengthTest:
    item = (
        db.query(core_model.CoreStrengthTest)
        .filter(
            core_model.CoreStrengthTest.id == item_id,
            core_model.CoreStrengthTest.user_id == user.id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Протокол не найден")
    return item


def _fill(item: core_model.CoreStrengthTest, data: core_schemas.CoreCreate) -> None:
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
def core_catalog(_user: User = Depends(get_current_user)):
    return catalog()


@router.post("/", response_model=core_schemas.CoreResponse, status_code=201)
def create_core(
    data: core_schemas.CoreCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = core_model.CoreStrengthTest(user_id=current_user.id)
    _fill(item, data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/", response_model=list[core_schemas.CoreResponse])
def list_core(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(core_model.CoreStrengthTest)
        .filter(core_model.CoreStrengthTest.user_id == current_user.id)
        .order_by(core_model.CoreStrengthTest.id.desc())
        .all()
    )


@router.get("/{item_id}", response_model=core_schemas.CoreResponse)
def get_core(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return _owned(db, item_id, current_user)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_core(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = _owned(db, item_id, current_user)
    db.delete(item)
    db.commit()
    return None
