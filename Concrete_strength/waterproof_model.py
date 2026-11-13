from sqlalchemy import Boolean, Column, Float, Integer, JSON, String

from database import Base


class WaterproofTest(Base):
    """Протокол водонепроницаемости — метод мокрого пятна, ГОСТ 12730.5-2018 п. 4."""

    __tablename__ = "waterproof_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    work_status = Column(String(20), nullable=False, default="in_progress")
    payment_status = Column(String(20), nullable=False, default="unpaid")
    service_order_id = Column(Integer, nullable=True, index=True)

    applicant_info = Column(String(100), nullable=False)
    manufacturer_info = Column(String(100), nullable=False)
    product_id = Column(String(100), nullable=False)
    tnpa = Column(String(60), nullable=False, default="ГОСТ 12730.5-2018")
    general_tnpa = Column(String(40), nullable=False, default="ГОСТ 12730.0-2020")
    concrete_class = Column(String(20), nullable=False)

    mode = Column(String(20), nullable=False)  # determine_mark | check_project
    sample_height_mm = Column(Integer, nullable=False)
    project_mark = Column(String(8), nullable=True)

    # Для каждого из 6 образцов: диаметр открытого торца, мм (≥130 по п. 4.2.3)
    sample_diameters_mm = Column(JSON, nullable=False)
    # Для каждого из 6 образцов: макс. давление без фильтрации, МПа (п. 4.4.1)
    sample_dry_pressures_mpa = Column(JSON, nullable=False)

    hold_hours = Column(Float, nullable=True)
    series_pressure_mpa = Column(Float, nullable=True)
    achieved_mark = Column(String(8), nullable=True)
    project_mark_met = Column(Boolean, nullable=True)
    samples_ok_at_series = Column(Integer, nullable=True)
    conclusion = Column(String(600), nullable=True)
