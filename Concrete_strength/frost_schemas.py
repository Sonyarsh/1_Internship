from typing import Literal

from pydantic import BaseModel, Field, model_validator


class FrostCreate(BaseModel):
    applicant_info: str = Field(..., min_length=1, max_length=100)
    manufacturer_info: str = Field(..., min_length=1, max_length=100)
    product_id: str = Field(..., min_length=1, max_length=100)
    tnpa: str = Field("ГОСТ 10060-2012", max_length=40)
    concrete_class: str = Field(..., min_length=1, max_length=20)

    method: Literal["basic1", "basic2", "accel2", "accel3"]
    exposure: Literal["water", "mineralized"]
    lightweight: bool = False
    sample_size_mm: Literal[100, 150]
    project_mark: int = Field(..., ge=25, le=1000)
    cycles_done: int = Field(..., ge=0, le=5000)

    freeze_temp_c: float = Field(..., ge=-80, le=5)
    freeze_hours: float = Field(..., gt=0, le=48)
    thaw_temp_c: float = Field(..., ge=0, le=40)
    thaw_hours: float = Field(..., gt=0, le=48)

    control_strengths: list[float] = Field(..., min_length=4, max_length=6)
    main_strengths: list[float] = Field(..., min_length=4, max_length=6)
    mass_before_g: list[float] = Field(..., min_length=4, max_length=6)
    mass_after_g: list[float] = Field(..., min_length=4, max_length=6)

    cracks: bool = False
    chips: bool = False
    edge_scaling: bool = False
    surface_scaling: bool = False
    decorative_surface: bool = False
    density_spread_kg_m3: float | None = Field(default=None, ge=0, le=500)

    @model_validator(mode="after")
    def masses_match_samples(self):
        if len(self.mass_before_g) != len(self.main_strengths) or len(self.mass_after_g) != len(self.main_strengths):
            raise ValueError("Для каждого основного образца укажите массу до и после циклов")
        return self


class FrostResponse(FrostCreate):
    id: int
    user_id: int | None = None
    mark_group: str | None = None
    x_cp_control: float | None = None
    x_cp_main: float | None = None
    sigma_control: float | None = None
    sigma_main: float | None = None
    v_control_pct: float | None = None
    v_main_pct: float | None = None
    x_min_control: float | None = None
    x_min_main: float | None = None
    limit_09: float | None = None
    strength_drop_pct: float | None = None
    mass_loss_pct: float | None = None
    series_valid: bool | None = None
    strength_ok: bool | None = None
    mass_ok: bool | None = None
    defects_ok: bool | None = None
    regime_ok: bool | None = None
    achieved_mark: str | None = None
    project_mark_met: bool | None = None
    conclusion: str | None = None

    class Config:
        from_attributes = True
