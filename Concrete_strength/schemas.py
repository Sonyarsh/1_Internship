from pydantic import BaseModel, Field, field_validator
from typing import Optional


class ConcreteStrengthCreate(BaseModel):
    """Поля, которые вводит пользователь. Средние и fc считаются на бэкенде."""

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "applicant_info": "ООО Тест",
                    "manufacturer_info": "Завод 1",
                    "product_id": "Плита П1",
                    "tnpa": "СТБ 1544",
                    "concrete_class": "C25/30",
                    "fck_cyl": 25,
                    "fck_cube": 30,
                    "batch_N": 1,
                    "sample_N": 1,
                    "series_N": 1,
                    "visual_inspection_defects": "нет",
                    "a1_geometry": 100,
                    "a2_geometry": 100,
                    "a3_geometry": 100,
                    "a4_geometry": 100,
                    "b1_geometry": 100,
                    "b2_geometry": 100,
                    "b3_geometry": 100,
                    "b4_geometry": 100,
                    "h1_geometry": 100,
                    "h2_geometry": 100,
                    "h3_geometry": 100,
                    "h4_geometry": 100,
                    "mass_m": 2.4,
                    "o1": 0.1,
                    "base_b1": 100,
                    "o2": 0.1,
                    "o3": 0.1,
                    "base_b2": 100,
                    "loading_speed": 0.6,
                    "loading_time": 60,
                    "max_force_f": 300,
                    "scale_factor_alpha": 1.00,
                    "visual_inspection_broken": "норма",
                    "destruction_scheme": "A",
                }
            ]
        }
    }

    applicant_info: str = Field(..., min_length=1, max_length=100)
    manufacturer_info: str = Field(..., min_length=1, max_length=100)
    product_id: str = Field(..., min_length=1, max_length=100)
    tnpa: str = Field(..., min_length=1, max_length=30)
    concrete_class: str = Field(..., min_length=1, max_length=10)

    fck_cyl: int = Field(..., ge=0)
    fck_cube: int = Field(..., ge=0)
    batch_N: int = Field(..., ge=1)
    sample_N: int = Field(..., ge=1)
    series_N: int = Field(..., ge=1)

    visual_inspection_defects: Optional[str] = None

    a1_geometry: float = Field(..., gt=0)
    a2_geometry: float = Field(..., gt=0)
    a3_geometry: float = Field(..., gt=0)
    a4_geometry: float = Field(..., gt=0)

    b1_geometry: float = Field(..., gt=0)
    b2_geometry: float = Field(..., gt=0)
    b3_geometry: float = Field(..., gt=0)
    b4_geometry: float = Field(..., gt=0)

    h1_geometry: float = Field(..., gt=0)
    h2_geometry: float = Field(..., gt=0)
    h3_geometry: float = Field(..., gt=0)
    h4_geometry: float = Field(..., gt=0)

    mass_m: float = Field(..., gt=0)

    o1: float = Field(0)
    base_b1: int = Field(..., gt=0, description="База B1, не может быть 0")
    o2: float = Field(0)
    o3: float = Field(0)
    base_b2: int = Field(..., gt=0, description="База B2, не может быть 0")

    loading_speed: float = Field(..., ge=0)
    loading_time: float = Field(..., ge=0)
    max_force_f: float = Field(..., ge=0)
    scale_factor_alpha: float = Field(
        1.00,
        gt=0,
        description="Коэффициент α, ровно 2 знака после запятой",
        examples=[1.00, 1.05, 0.95],
    )

    visual_inspection_broken: Optional[str] = None
    destruction_scheme: Optional[str] = None

    @field_validator("scale_factor_alpha")
    @classmethod
    def round_alpha_two_decimals(cls, v: float) -> float:
        return round(float(v), 2)


class ConcreteStrengthResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    applicant_info: str
    manufacturer_info: str
    product_id: str
    tnpa: str
    concrete_class: str
    fck_cyl: int
    fck_cube: int
    batch_N: int
    sample_N: int
    series_N: int
    visual_inspection_defects: Optional[str] = None

    a1_geometry: float
    a2_geometry: float
    a3_geometry: float
    a4_geometry: float
    a_avg: Optional[float] = None

    b1_geometry: float
    b2_geometry: float
    b3_geometry: float
    b4_geometry: float
    b_avg: Optional[float] = None

    h1_geometry: float
    h2_geometry: float
    h3_geometry: float
    h4_geometry: float
    h_avg: Optional[float] = None

    volume_v: Optional[float] = None
    mass_m: float
    density_avg: Optional[float] = None

    o1: float
    constant_c1: Optional[float] = None
    base_b1: int
    flatness_deviation: Optional[float] = None
    o2: float
    concavity_convexity: Optional[float] = None
    o3: float
    base_b2: int
    constant_c2: Optional[float] = None
    perpendicularity_deviation: Optional[float] = None

    loading_speed: float
    loading_time: float
    max_force_f: float
    scale_factor_alpha: float
    working_area_a: Optional[float] = None

    fc_cube_batch_i_sample_j_series_k: Optional[float] = None
    fcm_avg_strength_k: Optional[float] = None
    fcm_avgstrength_j_k: Optional[float] = None
    fcm_avg_strength_i_j_k: Optional[float] = None

    visual_inspection_broken: Optional[str] = None
    destruction_scheme: Optional[str] = None

    class Config:
        from_attributes = True
