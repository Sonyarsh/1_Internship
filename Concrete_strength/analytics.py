Вот подробный пример, как сделать красивый аналитический endpoint в FastAPI, который возвращает структуру средних fcm по 4правилам.

1. Добавь зависимость сессии python

# B database.py уже есть get_session, который возвращает SQLAlchemy сессию, будем использовать его для доступа к данным.
from database import get_session

2. Аналитическую функцию помещаем в отдельный файл, например, services/analytics.py. Она будет принимать сессию и возвращать словарь с нужной структурой

# services/analytics.py

from models import ConcreteStrength

def get_fcm_aggregated(session):
    data = {}
    all_rows = session.query(ConcreteStrength).all()

    for row in all_rows:
        batch = row.batch_N
        sample = row.sample_N
        series = row.series_N
        val = row.fc_cube_batch_i_sample_j_series_k
        if None in (batch, sample, series, val):
            continue
        data.setdefault(batch, {}).setdefault(sample, {}).setdefault(series, []).append(val)

    result = {}

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
            series_strengths = []
            for series, vals in serieses.items():
                v = avg_strength_k(vals)
                result[batch][sample][series] = {'fcm_avg_strength_k': v}
                series_strengths.append(v)
            mean_sample = sum(series_strengths)/len(series_strengths)
            result[batch][sample]['fcm_avgstrength_j_k'] = mean_sample
        sample_means = [result[batch][sample]['fcm_avgstrength_j_k'] for sample in samples]
        mean_batch = sum(sample_means)/len(sample_means)
        result[batch]['fcm_avg_strength_i_j_k'] = mean_batch

    return result

3. FastAPI endpoint
Создай файл routes/analytics.py (или добавь в основной роут-файл):
python

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_session
from services.analytics import get_fcm_aggregated

router = APIRouter()

@router.get("/analytics/fcm", summary="Аналитика FCM по партиям бетона")
def fcm_analysis(session: Session = Depends(get_session)):
    """
    Возвращает агрегированные средние прочности по партиям, образцам, сериям.
    """
    result = get_fcm_aggregated(session)
    return result
4. Подключи роутер в основном файле приложения python

# main.py
from fastapi import FastAPI
from routes.analytics import router as analytics_router

app = FastAPI()

app.include_router(analytics_router)
5. Красота ответа!
Ответ получится такой:

json

{
  "1": {
    "1": {
      "1": {"fcm_avg_strength_k": 45.2},
      "2": {"fcm_avg_strength_k": 47.3},
      "fcm_avgstrength_j_k": 46.25
    },
    "2": {
      ...
    },
    "fcm_avg_strength_i_j_k": 44.93
  },
  "2": {
    ...
  }
}
— где "1" — номер партии (batch_N), "1" внутри — sample_N, "1" внутри — series_N.

Итоговое использование
Запускаешь сервер:
uvicorn main:app
Открываешь браузер:
http://localhost:8000/analytics/fcm
Видишь агрегированную аналитику!

Добавим параметры фильтрации в endpoint — например, по batch_N (партии). Сделаем так, чтобы можно было передавать один или несколько номеров партии, или оставить пустым, чтобы взять все.

Обновим endpoint для фильтрации по batch_N
1. В services/analytics.py — добавим фильтр python

def get_fcm_aggregated(session, batch_filters=None):
    """
    batch_filters: список значений batch_N или None для всех.
    """
    data = {}
    query = session.query(ConcreteStrength)
    if batch_filters:
        query = query.filter(ConcreteStrength.batch_N.in_(batch_filters))
    all_rows = query.all()

    for row in all_rows:
        batch = row.batch_N
        sample = row.sample_N
        series = row.series_N
        val = row.fc_cube_batch_i_sample_j_series_k
        if None in (batch, sample, series, val):
            continue
        data.setdefault(batch, {}).setdefault(sample, {}).setdefault(series, []).append(val)

    # остальной код без изменений...
    # (он остается точно таким же)
    result = {}
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
            series_strengths = []
            for series, vals in serieses.items():
                v = avg_strength_k(vals)
                result[batch][sample][series] = {'fcm_avg_strength_k': v}
                series_strengths.append(v)
            mean_sample = sum(series_strengths)/len(series_strengths)
            result[batch][sample]['fcm_avgstrength_j_k'] = mean_sample
        sample_means = [result[batch][sample]['fcm_avgstrength_j_k'] for sample in samples]
        mean_batch = sum(sample_means)/len(sample_means)
        result[batch]['fcm_avg_strength_i_j_k'] = mean_batch

    return result
2. Обновим API-роут
python

from fastapi import Query

@router.get("/analytics/fcm", summary="Аналитика FCM по партиям бетона")
def fcm_analysis(
    batch: list[int] = Query(None, description="Номера партий (batch_N), по которым фильтровать, оставить пустым для всех"),
    session: Session = Depends(get_session)
):
    """
    Возвращает агрегированные средние прочности по партиям, образцам, сериям.
    Можно фильтровать по номерам партий (`batch`).
    """
    result = get_fcm_aggregated(session, batch_filters=batch)
    return result
3. Как пользоватьсяcd 
Чтобы получить все партии:
GET /analytics/fcm

Чтобы выбрать конкретные:
GET /analytics/fcm?batch=1&batch=3

Можно оставить пустым — будет возвращена вся база.

Итог
Теперь можно фильтровать по партиям через параметры URL. Если нужно фильтровать по другим параметрам (sample_N, series_N) — скажи, сделаем тоже!

Такой механизм делает API очень гибким и удобным для аналитики.

Теперь добавим фильтрацию по трём параметрам:

batch_N
sample_N
series_N
1. Изменим функцию в services/analytics.py
python

def get_fcm_aggregated(session, batch_filters=None, sample_filters=None, series_filters=None):
    """
    batch_filters, sample_filters, series_filters: списки значений или None.
    """
    query = session.query(ConcreteStrength)
    if batch_filters:
        query = query.filter(ConcreteStrength.batch_N.in_(batch_filters))
    if sample_filters:
        query = query.filter(ConcreteStrength.sample_N.in_(sample_filters))
    if series_filters:
        query = query.filter(ConcreteStrength.series_N.in_(series_filters))
    all_rows = query.all()

    data = {}
    for row in all_rows:
        batch = row.batch_N
        sample = row.sample_N
        series = row.series_N
        val = row.fc_cube_batch_i_sample_j_series_k
        if None in (batch, sample, series, val):
            continue
        data.setdefault(batch, {}).setdefault(sample, {}).setdefault(series, []).append(val)

    result = {}
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
            series_strengths = []
            for series, vals in serieses.items():
                v = avg_strength_k(vals)
                result[batch][sample][series] = {'fcm_avg_strength_k': v}
                series_strengths.append(v)
            if series_strengths:
                mean_sample = sum(series_strengths)/len(series_strengths)
                result[batch][sample]['fcm_avgstrength_j_k'] = mean_sample
        sample_means = [result[batch][sample]['fcm_avgstrength_j_k'] for sample in samples if 'fcm_avgstrength_j_k' in result[batch][sample]]
        if sample_means:
            mean_batch = sum(sample_means)/len(sample_means)
            result[batch]['fcm_avg_strength_i_j_k'] = mean_batch

    return result
2. Обновим роут (например, в routes/analytics.py)
python

from fastapi import Query

@router.get("/analytics/fcm", summary="Аналитика FCM с фильтрами")
def fcm_analysis(
    batch: list[int] = Query(None, description="Номера партий (batch_N)"),
    sample: list[int] = Query(None, description="Номера образцов (sample_N)"),
    series: list[int] = Query(None, description="Номера серий (series_N)"),
    session: Session = Depends(get_session)
):
    """
    Аналитика прочности бетона с фильтрами по batch_N, sample_N, series_N.
    """
    result = get_fcm_aggregated(
        session,
        batch_filters=batch,
        sample_filters=sample,
        series_filters=series
    )
    return result
3. Как пользоваться
Все данные:
GET /analytics/fcm

Фильтр по batch_N, sample_N, series_N:
GET /analytics/fcm?batch=1&sample=2&series=3

Фильтр по нескольким значениям:
GET /analytics/fcm?batch=1&batch=2&sample=1&series=5&series=6

Теперь сервис поддерживает гибкую аналитику по всем нужным параметрам


from sqlalchemy.orm import Session
from models import ConcreteStrength


def avg_strength_k(vals):

    vals = sorted(vals, reverse=True)
    k = len(vals)

    if k == 6:
        return sum(vals[:4]) / 4

    elif k == 4:
        return sum(vals[:3]) / 3

    elif k == 3:
        return sum(vals[:2]) / 2

    elif k == 2:
        return sum(vals[:2]) / 2

    return sum(vals) / len(vals)


def get_fcm_aggregated(
    session: Session,
    batch_filters=None,
    sample_filters=None,
    series_filters=None
):

    query = session.query(ConcreteStrength)

    if batch_filters:
        query = query.filter(
            ConcreteStrength.batch_N.in_(batch_filters)
        )

    if sample_filters:
        query = query.filter(
            ConcreteStrength.sample_N.in_(sample_filters)
        )

    if series_filters:
        query = query.filter(
            ConcreteStrength.series_N.in_(series_filters)
        )

    all_rows = query.all()

    data = {}

    for row in all_rows:

        batch = row.batch_N
        sample = row.sample_N
        series = row.series_N
        val = row.fc_cube_batch_i_sample_j_series_k

        if None in (batch, sample, series, val):
            continue

        data \
            .setdefault(batch, {}) \
            .setdefault(sample, {}) \
            .setdefault(series, []) \
            .append(val)

    result = {}

    for batch, samples in data.items():

        result.setdefault(batch, {})

        for sample, serieses in samples.items():

            result[batch].setdefault(sample, {})

            series_strengths = []

            for series, vals in serieses.items():

                avg_series = avg_strength_k(vals)

                result[batch][sample][series] = {
                    "fcm_avg_strength_k": round(avg_series, 3)
                }

                series_strengths.append(avg_series)

            if series_strengths:

                mean_sample = (
                    sum(series_strengths) /
                    len(series_strengths)
                )

                result[batch][sample][
                    "fcm_avgstrength_j_k"
                ] = round(mean_sample, 3)

        sample_means = [
            result[batch][sample]["fcm_avgstrength_j_k"]
            for sample in samples
            if "fcm_avgstrength_j_k"
            in result[batch][sample]
        ]

        if sample_means:

            mean_batch = (
                sum(sample_means) /
                len(sample_means)
            )

            result[batch][
                "fcm_avg_strength_i_j_k"
            ] = round(mean_batch, 3)

    return result