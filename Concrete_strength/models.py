from sqlalchemy import Column, Integer, Float, String
from database import Base


class ConcreteStrength(Base):
    __tablename__ = "concrete_strengths"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # Информация о проекте
    applicant_info = Column(String(100), nullable=False)
    manufacturer_info = Column(String(100), nullable=False)
    product_id = Column(String(100), nullable=False)
    tnpa = Column(String(30), nullable=False)
    concrete_class = Column(String(10), nullable=False)

    fck_cyl = Column(Integer, nullable=False)
    fck_cube = Column(Integer, nullable=False)

    batch_N = Column(Integer, nullable=False)
    sample_N = Column(Integer, nullable=False)
    series_N = Column(Integer, nullable=False)

    # Визуальный контроль
    visual_inspection_defects = Column(String(255), nullable=True)

    # Геометрия
    a1_geometry = Column(Float, nullable=False)
    a2_geometry = Column(Float, nullable=False)
    a3_geometry = Column(Float, nullable=False)
    a4_geometry = Column(Float, nullable=False)
    a_avg = Column(Float, nullable=True)

    b1_geometry = Column(Float, nullable=False)
    b2_geometry = Column(Float, nullable=False)
    b3_geometry = Column(Float, nullable=False)
    b4_geometry = Column(Float, nullable=False)
    b_avg = Column(Float, nullable=True)

    h1_geometry = Column(Float, nullable=False)
    h2_geometry = Column(Float, nullable=False)
    h3_geometry = Column(Float, nullable=False)
    h4_geometry = Column(Float, nullable=False)
    h_avg = Column(Float, nullable=True)

    volume_v = Column(Float, nullable=True)
    mass_m = Column(Float, nullable=False)
    density_avg = Column(Float, nullable=True)

    # Инструментальные измерения
    o1 = Column(Float, nullable=False)
    constant_c1 = Column(Float, nullable=True)
    base_b1 = Column(Integer, nullable=False)
    flatness_deviation = Column(Float, nullable=True)

    o2 = Column(Float, nullable=False)
    concavity_convexity = Column(Float, nullable=True)

    o3 = Column(Float, nullable=False)
    base_b2 = Column(Integer, nullable=False)
    constant_c2 = Column(Float, nullable=True)
    perpendicularity_deviation = Column(Float, nullable=True)

    # Испытание
    loading_speed = Column(Float, nullable=False)
    loading_time = Column(Float, nullable=False)
    max_force_f = Column(Float, nullable=False)
    scale_factor_alpha = Column(Float, nullable=False)
    working_area_a = Column(Float, nullable=True)

    # Результаты
    fc_cube_batch_i_sample_j_series_k = Column(Float, nullable=True)
    fcm_avg_strength_k = Column(Float, nullable=True)
    fcm_avgstrength_j_k = Column(Float, nullable=True)
    fcm_avg_strength_i_j_k = Column(Float, nullable=True)

    visual_inspection_broken = Column(String(255), nullable=True)
    destruction_scheme = Column(String(50), nullable=True)

    def calculate_fields(self):
        self.a_avg = (
            self.a1_geometry + self.a2_geometry + self.a3_geometry + self.a4_geometry
        ) / 4
        self.b_avg = (
            self.b1_geometry + self.b2_geometry + self.b3_geometry + self.b4_geometry
        ) / 4
        self.h_avg = (
            self.h1_geometry + self.h2_geometry + self.h3_geometry + self.h4_geometry
        ) / 4

        self.volume_v = self.a_avg * self.b_avg * self.h_avg
        if self.volume_v != 0:
            self.density_avg = self.mass_m / self.volume_v

        if self.base_b1 and self.base_b1 != 0:
            self.constant_c1 = 100 / self.base_b1
            self.flatness_deviation = self.constant_c1 * self.o1 / 2
            self.concavity_convexity = self.constant_c1 * (self.o2 - self.o1 / 4)
        else:
            self.constant_c1 = None
            self.flatness_deviation = None
            self.concavity_convexity = None

        if self.base_b2 and self.base_b2 != 0:
            self.constant_c2 = 100 / self.base_b2
            self.perpendicularity_deviation = self.constant_c2 * self.o3
        else:
            self.constant_c2 = None
            self.perpendicularity_deviation = None

        self.working_area_a = self.a_avg * self.b_avg
        if self.working_area_a != 0:
            self.fc_cube_batch_i_sample_j_series_k = (
                self.scale_factor_alpha * self.max_force_f / self.working_area_a
            )
