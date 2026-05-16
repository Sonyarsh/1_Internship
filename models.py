from sqlalchemy import Column, Integer, Float, String
from database import Base

class ConcreteStrength(Base):
    __tablename__ = 'concrete_strengths'

    id = Column(Integer, primary_key=True, index=True)
    
    # Информация о проекте
    applicant_info = Column(String(100), name='Информация о заявителе', nullable=False)
    manufacturer_info = Column(String(100), name='Информация об изготовителе', nullable=False)
    product_id = Column(String(100), name='Идентификация продукции', nullable=False)
    tnpa = Column(String(30), name='ТНПА на продукцию', nullable=False)
    concrete_class = Column(String(10), name='Класс бетона по прочности на сжатие', nullable=False)
    fck_cyl = Column(Integer, nullable=False)          # характеристическая прочность в цилиндрическом образце, МПа
    fck_cube = Column(Integer, nullable=False)         # характеристическая прочность в кубическом образце, МПа
    batch_n = Column(Integer, name='N партии', nullable=False)
    sample_n = Column(Integer, name='N пробы', nullable=False)
    series_n = Column(Integer, name='N серии', nullable=False)
    
    # Визуальный контроль
    visual_inspection_defects = Column(String(255), name='Визуальный осмотр образца на наличие дефектов', nullable=True)
    
    # Геометрия образца
    a1 = Column(Float, nullable=False)
    a2 = Column(Float, nullable=False)
    a3 = Column(Float, nullable=False)
    a4 = Column(Float, nullable=False)
    a_avg = Column(Float, name='a', nullable=False)
    
    b1_geometry = Column(Float, name='b_1', nullable=False)
    b2_geometry = Column(Float, name='b_2', nullable=False)
    b3_geometry = Column(Float, name='b_3', nullable=False)
    b4_geometry = Column(Float, name='b_4', nullable=False)
    b_avg = Column(Float, name='b', nullable=False)
    
    h1 = Column(Float, nullable=False)
    h2 = Column(Float, nullable=False)
    h3 = Column(Float, nullable=False)
    h4 = Column(Float, nullable=False)
    h_avg = Column(Float, name='h', nullable=False)
    
    volume_v = Column(Float, name='V', nullable=False)
    mass_m = Column(Float, name='m', nullable=False)
    density_rho = Column(Float, name='ρc', nullable=False)
    
    # Инструментальные замеры (ГОСТ 10180-2012)
    o1 = Column(Float, name='О1', nullable=False)
    c1 = Column(Float, name='С1', nullable=False)
    base_b1 = Column(Integer, name='B1', nullable=False)
    flatness_deviation = Column(Float, name='А_отклонение_плоскостности', nullable=False)
    
    o2 = Column(Float, name='О2', nullable=False)
    concavity_convexity = Column(Float, name='B', nullable=False)
    
    o3 = Column(Float, name='О3', nullable=False)
    base_b2 = Column(Integer, name='B2', nullable=False)
    constant_c2 = Column(Float, name='C2', nullable=False)
    perpendicularity_deviation = Column(Float, name='C', nullable=False)
    
    # Испытание
    loading_speed = Column(Float, name='v_скорость_нагружения', nullable=False)
    loading_time = Column(Float, name='Т_время_нагружения', nullable=False)
    max_force_f = Column(Float, name='F', nullable=False)
    scale_factor_alpha = Column(Float, name='α', nullable=False)
    working_area_a = Column(Float, name='А_площадь_сечения', nullable=False)
    
    # Результаты
    ri_strength = Column(Float, name='Ri', nullable=False)
    fc_cube_i = Column(Float, name='fc.cube.i', nullable=False)
    rm_avg_strength = Column(Float, name='Rm', nullable=False)
    fcm_avg_strength = Column(Float, name='fcm', nullable=False)
    
    visual_inspection_broken = Column(String(255), name='Визуальный осмотр разрушенного образца', nullable=True)
    destruction_scheme = Column(String(50), name='Схема разрушения образца', nullable=True)
