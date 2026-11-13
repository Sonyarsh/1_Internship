from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from database import Base


class ServiceOrder(Base):
    """Заказ услуги по прайсу (без онлайн-оплаты)."""

    __tablename__ = "service_orders"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)

    name = Column(String(100), nullable=False)
    phone = Column(String(40), nullable=True)
    email = Column(String(120), nullable=False)

    service_key = Column(String(40), nullable=False, index=True)
    service_title = Column(String(120), nullable=False)
    price_label = Column(String(40), nullable=False)
    price_from_byn = Column(Integer, nullable=False, default=0)
    quantity = Column(Integer, nullable=False, default=1)

    message = Column(Text, nullable=True)

    # new | confirmed | in_progress | completed | cancelled
    status = Column(String(20), nullable=False, default="new", index=True)
    # unpaid | invoiced | paid
    payment_status = Column(String(20), nullable=False, default="unpaid", index=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
