from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from database import Base


class ContactRequest(Base):
    """Заявка с сайта: интерес к испытанию / вопрос лаборатории."""

    __tablename__ = "contact_requests"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(40), nullable=True)
    email = Column(String(120), nullable=False)
    service_type = Column(String(80), nullable=True)
    message = Column(String(1000), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
