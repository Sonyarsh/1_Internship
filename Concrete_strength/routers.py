from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_session

router = APIRouter()

@router.post("/", response_model=schemas.ConcreteStrengthResponse)
def create_record(data: schemas.ConcreteStrengthCreate, db: Session = Depends(get_session)):
    db_item = models.ConcreteStrength(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[schemas.ConcreteStrengthResponse])
def get_all_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    items = db.query(models.ConcreteStrength).offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=schemas.ConcreteStrengthResponse)
def get_record(item_id: int, db: Session = Depends(get_session)):
    item = db.query(models.ConcreteStrength).filter(models.ConcreteStrength.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return item



from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

import models
import schemas

from database import get_session

from services.analytics import get_fcm_aggregated


router = APIRouter()


@router.post(
    "/",
    response_model=schemas.ConcreteStrengthResponse
)
def create_record(
    data: schemas.ConcreteStrengthCreate,
    db: Session = Depends(get_session)
):

    db_item = models.ConcreteStrength(
        **data.model_dump()
    )

    # вычисляем автоматические поля
    db_item.calculate_fields()

    db.add(db_item)

    db.commit()

    db.refresh(db_item)

    return db_item


@router.get(
    "/",
    response_model=List[schemas.ConcreteStrengthResponse]
)
def get_all_records(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session)
):

    items = (
        db.query(models.ConcreteStrength)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return items


@router.get(
    "/{item_id}",
    response_model=schemas.ConcreteStrengthResponse
)
def get_record(
    item_id: int,
    db: Session = Depends(get_session)
):

    item = (
        db.query(models.ConcreteStrength)
        .filter(models.ConcreteStrength.id == item_id)
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Запись не найдена"
        )

    return item


@router.get(
    "/analytics/fcm",
    summary="Аналитика FCM"
)
def fcm_analysis(

    batch: list[int] = Query(
        default=None,
        description="Фильтр по batch_N"
    ),

    sample: list[int] = Query(
        default=None,
        description="Фильтр по sample_N"
    ),

    series: list[int] = Query(
        default=None,
        description="Фильтр по series_N"
    ),

    db: Session = Depends(get_session)
):

    result = get_fcm_aggregated(
        session=db,
        batch_filters=batch,
        sample_filters=sample,
        series_filters=series
    )

    return result