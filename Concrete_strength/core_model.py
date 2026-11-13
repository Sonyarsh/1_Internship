from sqlalchemy import Column, Float, Integer, JSON, String

from database import Base


class CoreStrengthTest(Base):
    """Сжатие образцов из конструкций — ГОСТ 28570-2019."""

    __tablename__ = "core_strength_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    work_status = Column(String(20), nullable=False, default="in_progress")
    payment_status = Column(String(20), nullable=False, default="unpaid")
    service_order_id = Column(Integer, nullable=True, index=True)

    applicant_info = Column(String(100), nullable=False)
    manufacturer_info = Column(String(100), nullable=False)
    product_id = Column(String(100), nullable=False)
    structure_name = Column(String(200), nullable=False)
    tnpa = Column(String(40), nullable=False, default="ГОСТ 28570-2019")
    concrete_class = Column(String(20), nullable=False)
    sampling_note = Column(String(255), nullable=True)

    # [{shape, force_kn, edge_mm?, diameter_mm?, height_mm?, label?}, ...]
    samples = Column(JSON, nullable=False)

    sample_results = Column(JSON, nullable=True)
    series_strength_mpa = Column(Float, nullable=True)
    samples_count = Column(Integer, nullable=True)
    conclusion = Column(String(500), nullable=True)
