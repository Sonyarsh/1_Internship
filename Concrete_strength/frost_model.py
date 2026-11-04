from sqlalchemy import Boolean, Column, Float, Integer, JSON, String

from database import Base


class FrostTest(Base):
    """Протокол морозостойкости по ГОСТ 10060-2012."""

    __tablename__ = "frost_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)

    applicant_info = Column(String(100), nullable=False)
    manufacturer_info = Column(String(100), nullable=False)
    product_id = Column(String(100), nullable=False)
    tnpa = Column(String(40), nullable=False, default="ГОСТ 10060-2012")
    concrete_class = Column(String(20), nullable=False)

    method = Column(String(12), nullable=False)
    exposure = Column(String(20), nullable=False)
    lightweight = Column(Boolean, nullable=False, default=False)
    sample_size_mm = Column(Integer, nullable=False)
    project_mark = Column(Integer, nullable=False)
    cycles_done = Column(Integer, nullable=False)

    freeze_temp_c = Column(Float, nullable=False)
    freeze_hours = Column(Float, nullable=False)
    thaw_temp_c = Column(Float, nullable=False)
    thaw_hours = Column(Float, nullable=False)

    control_strengths = Column(JSON, nullable=False)
    main_strengths = Column(JSON, nullable=False)
    mass_before_g = Column(JSON, nullable=False)
    mass_after_g = Column(JSON, nullable=False)

    cracks = Column(Boolean, nullable=False, default=False)
    chips = Column(Boolean, nullable=False, default=False)
    edge_scaling = Column(Boolean, nullable=False, default=False)
    surface_scaling = Column(Boolean, nullable=False, default=False)
    decorative_surface = Column(Boolean, nullable=False, default=False)
    density_spread_kg_m3 = Column(Float, nullable=True)

    mark_group = Column(String(1), nullable=True)
    x_cp_control = Column(Float, nullable=True)
    x_cp_main = Column(Float, nullable=True)
    sigma_control = Column(Float, nullable=True)
    sigma_main = Column(Float, nullable=True)
    v_control_pct = Column(Float, nullable=True)
    v_main_pct = Column(Float, nullable=True)
    x_min_control = Column(Float, nullable=True)
    x_min_main = Column(Float, nullable=True)
    limit_09 = Column(Float, nullable=True)
    strength_drop_pct = Column(Float, nullable=True)
    mass_loss_pct = Column(Float, nullable=True)
    series_valid = Column(Boolean, nullable=True)
    strength_ok = Column(Boolean, nullable=True)
    mass_ok = Column(Boolean, nullable=True)
    defects_ok = Column(Boolean, nullable=True)
    regime_ok = Column(Boolean, nullable=True)
    achieved_mark = Column(String(12), nullable=True)
    project_mark_met = Column(Boolean, nullable=True)
    conclusion = Column(String(500), nullable=True)
