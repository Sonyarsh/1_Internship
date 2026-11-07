"""Водонепроницаемость по мокрому пятну — ГОСТ 12730.5-2018, раздел 4.

ГОСТ 12730.0-2020: общие условия испытаний; серия для водонепроницаемости — 6 образцов.
Базовый и арбитражный метод марки W — «мокрое пятно» (п. 4).

Суть (п. 4.3.2): давление поднимают ступенями по 0,2 МПа, выдерживают на ступени
по таблице 2; при появлении капель или мокрого пятна на верхней торцевой поверхности
испытание образца останавливают.

Обработка (п. 4.4):
- образец — макс. давление без фильтрации;
- серия — макс. давление, при котором ≥ 4 из 6 образцов без фильтрации;
- марка W — по таблице 3.
"""

from __future__ import annotations

# Таблица 2: высота образца → время выдержки на ступени, ч
HOLD_HOURS = {150: 16, 100: 12, 50: 6, 30: 4}

# Ступени давления, МПа (таблица 3)
PRESSURE_STEPS = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]

MARK_BY_PRESSURE = {
    0.2: "W2",
    0.4: "W4",
    0.6: "W6",
    0.8: "W8",
    1.0: "W10",
    1.2: "W12",
    1.4: "W14",
    1.6: "W16",
    1.8: "W18",
    2.0: "W20",
}


def catalog() -> dict:
    return {
        "method": "wet_spot",
        "title": "Метод мокрого пятна",
        "tnpa": "ГОСТ 12730.5-2018 п. 4",
        "general": "ГОСТ 12730.0-2020",
        "note": (
            "Серия — 6 образцов. Воду подают снизу; давление повышают ступенями "
            "по 0,2 МПа. Марка W — макс. давление (×0,1 МПа в обозначении), "
            "при котором фильтрации нет не менее чем на 4 из 6 образцов."
        ),
        "hold_hours": HOLD_HOURS,
        "pressure_steps_mpa": PRESSURE_STEPS,
        "marks": [{"pressure_mpa": p, "mark": m} for p, m in MARK_BY_PRESSURE.items()],
        "modes": [
            {
                "id": "determine_mark",
                "title": "Определение марки (п. 4.3.2)",
                "description": "Ступенчатый подъём давления до появления мокрого пятна на каждом образце.",
            },
            {
                "id": "check_project",
                "title": "Контроль проектной марки (п. 4.3.3)",
                "description": "Давление поднимают до проектной марки и выдерживают по таблице 2.",
            },
        ],
    }


def pressure_to_mark(pressure_mpa: float) -> str | None:
    key = round(float(pressure_mpa), 1)
    return MARK_BY_PRESSURE.get(key)


def mark_to_pressure(mark: str) -> float:
    mark = mark.strip().upper()
    for pressure, label in MARK_BY_PRESSURE.items():
        if label == mark:
            return pressure
    raise ValueError("Марка должна быть от W2 до W20")


def series_pressure(sample_dry_mpa: list[float]) -> float:
    """Макс. давление, при котором ≥4 образцов ещё без фильтрации."""
    if len(sample_dry_mpa) != 6:
        raise ValueError("Серия должна содержать ровно 6 образцов (ГОСТ 12730.0 / 12730.5)")
    best = 0.0
    for step in PRESSURE_STEPS:
        ok = sum(1 for p in sample_dry_mpa if float(p) + 1e-9 >= step)
        if ok >= 4:
            best = step
        else:
            break
    return best


def evaluate(payload: dict) -> dict:
    height = int(payload["sample_height_mm"])
    if height not in HOLD_HOURS:
        raise ValueError("Высота образца: 150, 100, 50 или 30 мм")

    mode = payload["mode"]
    diameters = [float(x) for x in payload["sample_diameters_mm"]]
    if len(diameters) != 6:
        raise ValueError("Укажите диаметр открытого торца для 6 образцов")
    for d in diameters:
        if d < 130:
            raise ValueError(
                "Диаметр открытой торцевой поверхности каждого образца ≥ 130 мм (п. 4.2.3)"
            )

    dry = [float(x) for x in payload["sample_dry_pressures_mpa"]]
    if len(dry) != 6:
        raise ValueError("Укажите результаты для 6 образцов")
    for p in dry:
        if p < 0 or p > 2.0 + 1e-9:
            raise ValueError("Давление образца должно быть от 0 до 2,0 МПа")
        # разрешаем 0 (фильтрация на первой ступени) и ступени 0.2…2.0
        rounded = round(p, 1)
        if p > 0 and rounded not in MARK_BY_PRESSURE and abs(p - rounded) > 1e-6:
            raise ValueError("Давление указывайте ступенями по 0,2 МПа")

    hold_h = HOLD_HOURS[height]
    series_p = series_pressure(dry)
    achieved = pressure_to_mark(series_p) if series_p > 0 else None

    project_mark = payload.get("project_mark") or None
    project_p = mark_to_pressure(project_mark) if project_mark else None

    if mode == "check_project":
        if not project_mark or project_p is None:
            raise ValueError("Для контроля укажите проектную марку W2–W20")
        # при контроле «сухое» давление образца = project_p, если фильтрации не было, иначе меньше
        passed = sum(1 for p in dry if p + 1e-9 >= project_p)
        project_met = passed >= 4
        if project_met:
            series_p = project_p
            achieved = project_mark
        conclusion = (
            f"Контроль марки {project_mark} (п. 4.3.3): "
            f"без фильтрации {passed} из 6 при {project_p:.1f} МПа, выдержка {hold_h} ч. "
            + ("Марка подтверждена." if project_met else "Марка не подтверждена.")
        )
    else:
        project_met = (
            bool(project_p is not None and series_p + 1e-9 >= project_p)
            if project_p is not None
            else None
        )
        conclusion = (
            f"Метод мокрого пятна (п. 4.3.2–4.4): водонепроницаемость серии "
            f"{series_p:.1f} МПа → марка {achieved or 'не установлена'} "
            f"(≥4 из 6 без фильтрации). Выдержка ступени для h={height} мм: {hold_h} ч."
        )
        if project_mark:
            conclusion += (
                f" Заявленная {project_mark}: "
                + ("соответствует." if project_met else "не соответствует.")
            )

    return {
        "hold_hours": hold_h,
        "series_pressure_mpa": series_p if series_p > 0 else None,
        "achieved_mark": achieved,
        "project_mark_met": project_met,
        "samples_ok_at_series": (
            sum(1 for p in dry if series_p > 0 and p + 1e-9 >= series_p) if series_p > 0 else 0
        ),
        "conclusion": conclusion,
    }
