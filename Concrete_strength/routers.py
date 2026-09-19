from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_session
from deps import get_current_user
from user_model import User

router = APIRouter()


def get_owned_record(db: Session, item_id: int, user: User) -> models.ConcreteStrength:
    """Запись существует и принадлежит текущему пользователю."""
    item = (
        db.query(models.ConcreteStrength)
        .filter(
            models.ConcreteStrength.id == item_id,
            models.ConcreteStrength.user_id == user.id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return item


@router.post("/", response_model=schemas.ConcreteStrengthResponse, status_code=201)
def create_record(
    data: schemas.ConcreteStrengthCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    db_item = models.ConcreteStrength(**data.model_dump())
    db_item.user_id = current_user.id
    db_item.calculate_fields()
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/", response_model=List[schemas.ConcreteStrengthResponse])
def get_all_records(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(models.ConcreteStrength)
        .filter(models.ConcreteStrength.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{item_id}", response_model=schemas.ConcreteStrengthResponse)
def get_record(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return get_owned_record(db, item_id, current_user)


@router.patch("/{item_id}", response_model=schemas.ConcreteStrengthResponse)
def update_record(
    item_id: int,
    data: schemas.ConcreteStrengthCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = get_owned_record(db, item_id, current_user)
    for key, value in data.model_dump().items():
        setattr(item, key, value)
    item.calculate_fields()
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    item_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = get_owned_record(db, item_id, current_user)
    db.delete(item)
    db.commit()
    return None
