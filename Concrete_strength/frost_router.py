from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import frost_model
import frost_schemas
from database import get_session
from deps import get_current_user
from frost_calc import catalog, evaluate
from user_model import User

router = APIRouter()


def _owned(db: Session, item_id: int, user: User) -> frost_model.FrostTest:
    item = (
        db.query(frost_model.FrostTest)
        .filter(frost_model.FrostTest.id == item_id, frost_model.FrostTest.user_id == user.id)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Протокол не найден")
    return item


def _fill(item: frost_model.FrostTest, data: frost_schemas.FrostCreate) -> None:
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
def frost_catalog(_user: User = Depends(get_current_user)):
    return catalog()


@router.post("/", response_model=frost_schemas.FrostResponse, status_code=201)
def create_frost(
    data: frost_schemas.FrostCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = frost_model.FrostTest(user_id=current_user.id)
    _fill(item, data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/", response_model=list[frost_schemas.FrostResponse])
def list_frost(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(frost_model.FrostTest)
        .filter(frost_model.FrostTest.user_id == current_user.id)
        .order_by(frost_model.FrostTest.id.desc())
        .all()
    )


@router.get("/{item_id}", response_model=frost_schemas.FrostResponse)
def get_frost(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return _owned(db, item_id, current_user)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_frost(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = _owned(db, item_id, current_user)
    db.delete(item)
    db.commit()
    return None
