from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class WaterproofCreate(BaseModel):
    applicant_info: str = Field(..., min_length=1, max_length=100)
    manufacturer_info: str = Field(..., min_length=1, max_length=100)
    product_id: str = Field(..., min_length=1, max_length=100)
    tnpa: str = Field("ГОСТ 12730.5-2018", max_length=60)
    general_tnpa: str = Field("ГОСТ 12730.0-2020", max_length=40)
    concrete_class: str = Field(..., min_length=1, max_length=20)

    mode: Literal["determine_mark", "check_project"]
    sample_height_mm: Literal[150, 100, 50, 30]
    project_mark: str | None = Field(default=None, max_length=8)

    sample_diameters_mm: list[float] = Field(..., min_length=6, max_length=6)
    sample_dry_pressures_mpa: list[float] = Field(..., min_length=6, max_length=6)
    service_order_id: int | None = None

    @field_validator("project_mark")
    @classmethod
    def normalize_mark(cls, v: str | None) -> str | None:
        if v is None or v.strip() == "":
            return None
        mark = v.strip().upper()
        allowed = {f"W{i}" for i in range(2, 22, 2)}
        if mark not in allowed:
            raise ValueError("Марка: W2, W4, … W20")
        return mark

    @field_validator("sample_diameters_mm")
    @classmethod
    def validate_diameters(cls, values: list[float]) -> list[float]:
        if len(values) != 6:
            raise ValueError("Укажите диаметр открытого торца для 6 образцов")
        for d in values:
            if float(d) < 130:
                raise ValueError(
                    "Диаметр открытой торцевой поверхности ≥ 130 мм (п. 4.2.3)"
                )
            if float(d) > 300:
                raise ValueError("Диаметр образца слишком большой")
        return [float(d) for d in values]

    @model_validator(mode="after")
    def check_project_required(self):
        if self.mode == "check_project" and not self.project_mark:
            raise ValueError("Для режима контроля укажите проектную марку")
        return self


class WaterproofResponse(WaterproofCreate):
    id: int
    user_id: int | None = None
    hold_hours: float | None = None
    series_pressure_mpa: float | None = None
    achieved_mark: str | None = None
    project_mark_met: bool | None = None
    samples_ok_at_series: int | None = None
    conclusion: str | None = None
    work_status: str | None = "in_progress"
    payment_status: str | None = "unpaid"
    service_order_id: int | None = None

    class Config:
        from_attributes = True
