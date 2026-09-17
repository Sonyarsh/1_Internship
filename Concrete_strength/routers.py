from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_session
from deps import get_current_user
from user_model import User

router = APIRouter()


@router.post("/", response_model=schemas.ConcreteStrengthResponse, status_code=201)
def create_record(
    data: schemas.ConcreteStrengthCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _ = current_user
    db_item = models.ConcreteStrength(**data.model_dump())
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
    _ = current_user
    return (
        db.query(models.ConcreteStrength)
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
    _ = current_user
    item = (
        db.query(models.ConcreteStrength)
        .filter(models.ConcreteStrength.id == item_id)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return item
