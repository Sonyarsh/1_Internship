from pydantic import BaseModel, Field
from typing import Optional

class ConcreteStrengthBase(BaseModel):
    applicant_info: str = Field(..., alias='Информация о заявителе')
    manufacturer_info: str = Field(..., alias='Информация об изготовителе')
    product_id: str = Field(..., alias='Идентификация продукции')
    tnpa: str = Field(..., alias='ТНПА на продукцию')
    concrete_class: str = Field(..., alias='Класс бетона по прочности на сжатие')
    fck_cyl: int
    fck_cube: int
    batch_n: int = Field(..., alias='N партии')
    sample_n: int = Field(..., alias='N пробы')
    series_n: int = Field(..., alias='N серии')
    
    visual_inspection_defects: Optional[str] = Field(None, alias='Визуальный осмотр образца на наличие дефектов')
    
    a1: float
    a2: float
    a3: float
    a4: float
    a_avg: float = Field(..., alias='a')
    
    b1_geometry: float = Field(..., alias='b_1')
    b2_geometry: float = Field(..., alias='b_2')
    b3_geometry: float = Field(..., alias='b_3')
    b4_geometry: float = Field(..., alias='b_4')
    b_avg: float = Field(..., alias='b')
    
    h1: float
    h2: float
    h3: float
    h4: float
    h_avg: float = Field(..., alias='h')
    
    volume_v: float = Field(..., alias='V')
    mass_m: float = Field(..., alias='m')
    density_rho: float = Field(..., alias='ρc')
    
    o1: float = Field(..., alias='О1')
    c1: float = Field(..., alias='С1')
    base_b1: int = Field(..., alias='B1')
    flatness_deviation: float = Field(..., alias='А_отклонение_плоскостности')
    
    o2: float = Field(..., alias='О2')
    concavity_convexity: float = Field(..., alias='B')
    
    o3: float = Field(..., alias='О3')
    base_b2: int = Field(..., alias='B2')
    constant_c2: float = Field(..., alias='C2')
    perpendicularity_deviation: float = Field(..., alias='C')
    
    loading_speed: float = Field(..., alias='v_скорость_нагружения')
    loading_time: float = Field(..., alias='Т_время_нагружения')
    max_force_f: float = Field(..., alias='F')
    scale_factor_alpha: float = Field(..., alias='α')
    working_area_a: float = Field(..., alias='А_площадь_сечения')
    
    ri_strength: float = Field(..., alias='Ri')
    fc_cube_i: float = Field(..., alias='fc.cube.i')
    rm_avg_strength: float = Field(..., alias='Rm')
    fcm_avg_strength: float = Field(..., alias='fcm')
    
    visual_inspection_broken: Optional[str] = Field(None, alias='Визуальный осмотр разрушенного образца')
    destruction_scheme: Optional[str] = Field(None, alias='Схема разрушения образца')

    class Config:
        populate_by_name = True
        from_attributes = True

class ConcreteStrengthCreate(ConcreteStrengthBase):
    pass

class ConcreteStrengthResponse(ConcreteStrengthBase):
    id: int
