from typing import Literal

from pydantic import BaseModel, Field, model_validator


class CoreSampleInput(BaseModel):
    shape: Literal["cube", "cylinder"]
    force_kn: float = Field(..., gt=0, le=10000)
    edge_mm: float | None = Field(default=None, gt=0, le=300)
    diameter_mm: float | None = Field(default=None, gt=0, le=300)
    height_mm: float | None = Field(default=None, gt=0, le=500)
    label: str | None = Field(default=None, max_length=80)

    @model_validator(mode="after")
    def shape_fields(self):
        if self.shape == "cube":
            if self.edge_mm is None:
                raise ValueError("Для куба укажите ребро, мм")
        else:
            if self.diameter_mm is None or self.height_mm is None:
                raise ValueError("Для цилиндра укажите диаметр и высоту, мм")
        return self


class CoreCreate(BaseModel):
    applicant_info: str = Field(..., min_length=1, max_length=100)
    manufacturer_info: str = Field(..., min_length=1, max_length=100)
    product_id: str = Field(..., min_length=1, max_length=100)
    structure_name: str = Field(..., min_length=1, max_length=200)
    tnpa: str = Field("ГОСТ 28570-2019", max_length=40)
    concrete_class: str = Field(..., min_length=1, max_length=20)
    sampling_note: str | None = Field(default=None, max_length=255)
    samples: list[CoreSampleInput] = Field(..., min_length=1, max_length=20)
    service_order_id: int | None = None


class CoreSampleResult(BaseModel):
    area_mm2: float
    alpha: float
    eta1: float
    hd_ratio: float | None = None
    r_obr_mpa: float
    r_mpa: float
    edge_mm: float | None = None
    diameter_mm: float | None = None
    height_mm: float | None = None


class CoreResponse(CoreCreate):
    id: int
    user_id: int | None = None
    sample_results: list[CoreSampleResult] | None = None
    series_strength_mpa: float | None = None
    samples_count: int | None = None
    conclusion: str | None = None
    work_status: str | None = "in_progress"
    payment_status: str | None = "unpaid"
    service_order_id: int | None = None

    class Config:
        from_attributes = True
