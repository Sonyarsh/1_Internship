from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_session
from contact_model import ContactRequest
from contact_schemas import ContactRequestCreate, ContactRequestResponse

router = APIRouter()


@router.post(
    "/",
    response_model=ContactRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_contact_request(
    payload: ContactRequestCreate,
    db: Session = Depends(get_session),
):
    """Публичная заявка с сайта — авторизация не нужна."""
    row = ContactRequest(
        name=payload.name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        email=str(payload.email).strip().lower(),
        service_type=payload.service_type.strip() if payload.service_type else None,
        message=payload.message.strip(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/", response_model=list[ContactRequestResponse])
def list_contact_requests(db: Session = Depends(get_session)):
    """Список заявок (для проверки в Swagger / учебной админки)."""
    return (
        db.query(ContactRequest)
        .order_by(ContactRequest.created_at.desc())
        .all()
    )
