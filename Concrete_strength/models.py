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
    batch_N = Column(Integer, name='N партии', nullable=False)
    sample_N = Column(Integer, name='N пробы', nullable=False)
    series_N = Column(Integer, name='N серии', nullable=False)
    
    # Визуальный контроль
    visual_inspection_defects = Column(String(255), name='Визуальный осмотр образца на наличие дефектов', nullable=True)
    
    # Геометрия образца
    a1_geometry = Column(Float, name='a_1', nullable=False)
    a2_geometry = Column(Float, name='a_2', nullable=False)
    a3_geometry = Column(Float, name='a_3', nullable=False)
    a4_geometry = Column(Float, name='a_4', nullable=False)
    a_avg = Column(Float, name='a', nullable=False)
    
    b1_geometry = Column(Float, name='b_1', nullable=False)
    b2_geometry = Column(Float, name='b_2', nullable=False)
    b3_geometry = Column(Float, name='b_3', nullable=False)
    b4_geometry = Column(Float, name='b_4', nullable=False)
    b_avg = Column(Float, name='b', nullable=False)
    
    h1_geometry = Column(Float, name='h_1', nullable=False)
    h2_geometry = Column(Float, name='h_2', nullable=False)
    h3_geometry = Column(Float, name='h_3', nullable=False)
    h4_geometry = Column(Float, name='h_4', nullable=False)
    h_avg = Column(Float, name='h', nullable=False)
    
    volume_v = Column(Float, name='V', nullable=False)
    mass_m = Column(Float, name='m', nullable=False)
    density_avg = Column(Float, name='ρc', nullable=False)
    
    # Инструментальные замеры (ГОСТ 10180-2012)
    o1 = Column(Float, name='О1', nullable=False)
    constant_c1 = Column(Float, name='С1', nullable=False)
    base_b1 = Column(Integer, name='base_B1', nullable=False)
    flatness_deviation = Column(Float, name='А_отклонение_плоскостности', nullable=False)
    
    o2 = Column(Float, name='О2', nullable=False)
    concavity_convexity = Column(Float, name='concav_convex_B', nullable=False)
    
    o3 = Column(Float, name='О3', nullable=False)
    base_b2 = Column(Integer, name='base_B2', nullable=False)
    constant_c2 = Column(Float, name='C2', nullable=False)
    perpendicularity_deviation = Column(Float, name='C', nullable=False)
    
    # Испытание
    loading_speed = Column(Float, name='v_скорость_нагружения', nullable=False)
    loading_time = Column(Float, name='Т_время_нагружения', nullable=False)
    max_force_f = Column(Float, name='F', nullable=False)
    scale_factor_alpha = Column(Float, name='α', nullable=False)
    working_area_a = Column(Float, name='А_площадь_сечения', nullable=False)
    
    # Результаты
    fc_cube_batch_i_sample_j_series_k = Column(Float, name='fc.cube.i.j.k', nullable=False)
    fcm_avg_strength_k = Column(Float, name='fcm.k', nullable=False)
    fcm_avgstrength_j_k = Column(Float, name='fcm.j.k', nullable=False)
    fcm_avg_strength_i_j_k = Column(Float, name='fcm.i.j.k', nullable=False)
    
    visual_inspection_broken = Column(String(255), name='Визуальный осмотр разрушенного образца', nullable=True)
    destruction_scheme = Column(String(50), name='Схема разрушения образца', nullable=True)




    def calculate_fields(self):
        self.a_avg = (self.a1_geometry + self.a2_geometry + self.a3_geometry + self.a4_geometry) / 4
        self.b_avg = (self.b1_geometry + self.b2_geometry + self.b3_geometry + self.b4_geometry) / 4
        self.h_avg = (self.h1_geometry + self.h2_geometry + self.h3_geometry + self.h4_geometry) / 4
        self.volume_v = self.a_avg * self.b_avg * self.h_avg
        self.constant_c1 = 100 / self.base_b1
        self.flatness_deviation = self.constant_c1 * self.o1 / 2
        self.concavity_convexity = self.constant_c1 * (self.o2 - self.o1 / 4)
        self.constant_c2 = 100 / self.base_b2
        self.perpendicularity_deviation = self.constant_c2 * self.o3
        self.working_area_a = self.a_avg * self.b_avg
        self.fc_cube_batch_i_sample_j_series_k = self.scale_factor_alpha * self.max_force_f / self.working_area_a
        


from sqlalchemy.orm import Session
from models import ConcreteStrength

def get_fcm_aggregated(session: Session):
    """
    Возвращает словарь со структурой:
    { batch_N: { sample_N: { series_N: [...значения...] }}} и итоговые средние.
    """

    # Получаем все записи
    all_rows = session.query(ConcreteStrength).all()

    # 1. Составим структуру: batch_N -> sample_N -> series_N -> [значения]
    data = {}
    for row in all_rows:
        batch = row.batch_N
        sample = row.sample_N
        series = row.series_N
        val = row.fc_cube_batch_i_sample_j_series_k
        if None in (batch, sample, series, val):  # Если поле не заполнено - пропускаем
            continue
        data.setdefault(batch, {}).setdefault(sample, {}).setdefault(series, []).append(val)

    # Итоговые словари для средних
    result = {}

    # 2. Считаем средние по series_N по правилам
    def avg_strength_k(vals):
        vals = sorted(vals, reverse=True)
        k = len(vals)
        if k == 6:
            return sum(vals[:4])/4
        elif k == 4:
            return sum(vals[:3])/3
        elif k == 3:
            return sum(vals[:2])/2
        elif k == 2:
            return sum(vals[:2])/2
        else:
            return sum(vals)/len(vals)

    for batch, samples in data.items():
        result.setdefault(batch, {})
        for sample, serieses in samples.items():
            result[batch].setdefault(sample, {})
            # Для каждой серии считаем fcm_avg_strength_k
            series_strengths = []
            for series, vals in serieses.items():
                v = avg_strength_k(vals)
                result[batch][sample][series] = {'fcm_avg_strength_k': v}
                series_strengths.append(v)
            # Для sample - fcm_avgstrength_j_k (среднее по сериям)
            mean_sample = sum(series_strengths)/len(series_strengths)
            result[batch][sample]['fcm_avgstrength_j_k'] = mean_sample
        # Для batch - fcm_avg_strength_i_j_k (среднее по samples внутри batch)
        sample_means = [result[batch][sample]['fcm_avgstrength_j_k'] for sample in samples]
        mean_batch = sum(sample_means)/len(sample_means)
        result[batch]['fcm_avg_strength_i_j_k'] = mean_batch

    return result

# --- Использовать так: ---

from database import get_session

with next(get_session()) as session:
    stats = get_fcm_aggregated(session)

# Для просмотра итогового среднего по всей партии (например, batch_N=1):
print(stats[1]['fcm_avg_strength_i_j_k'])

# Для доступа к средней по конкретному sample и series:
print(stats[1][1][2]['fcm_avg_strength_k'])  # где 1=batch_N, 1=sample_N, 2=series_N

# Для получения сводной информации по всем партиям (например, среднее по всем batch), нужно посчитать среднее из stats[*]['fcm_avg_strength_i_j_k']
# print(sum(stats[batch]['fcm_avg_strength_i_j_k'] for batch in stats) / len(stats))


from sqlalchemy import Column, Integer, Float, String
from database import Base


class ConcreteStrength(Base):
    __tablename__ = 'concrete_strengths'

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
            self.a1_geometry +
            self.a2_geometry +
            self.a3_geometry +
            self.a4_geometry
        ) / 4

        self.b_avg = (
            self.b1_geometry +
            self.b2_geometry +
            self.b3_geometry +
            self.b4_geometry
        ) / 4

        self.h_avg = (
            self.h1_geometry +
            self.h2_geometry +
            self.h3_geometry +
            self.h4_geometry
        ) / 4

        self.volume_v = self.a_avg * self.b_avg * self.h_avg

        if self.volume_v != 0:
            self.density_avg = self.mass_m / self.volume_v

        self.constant_c1 = 100 / self.base_b1
        self.flatness_deviation = self.constant_c1 * self.o1 / 2

        self.concavity_convexity = (
            self.constant_c1 * (self.o2 - self.o1 / 4)
        )

        self.constant_c2 = 100 / self.base_b2

        self.perpendicularity_deviation = (
            self.constant_c2 * self.o3
        )

        self.working_area_a = self.a_avg * self.b_avg

        if self.working_area_a != 0:
            self.fc_cube_batch_i_sample_j_series_k = (
                self.scale_factor_alpha *
                self.max_force_f /
                self.working_area_a
            )