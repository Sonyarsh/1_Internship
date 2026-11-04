"""Обработка протокола морозостойкости по ГОСТ 10060-2012.

Критерий прочности — нижняя граница доверительного интервала (приложение Д):
Xmin = Xср − t · σ, серия выдержала, если Xmin основных ≥ 0,9 · Xmin контрольных.
σ оценивают по размаху (таблица 6), t — критерий Стьюдента (таблица 7).
Потеря массы — формула (1), не более 2 %. Коэффициент вариации серии — не более 9 %.
"""

from __future__ import annotations

RANGE_ALPHA = {2: 1.13, 3: 1.69, 4: 2.06, 5: 2.33, 6: 2.5}
STUDENT_T = {4: 3.182, 5: 2.776, 6: 2.570}

# mark, intermediate cycles or None, cycles that confirm the mark (table 4)
_BASIC1 = [
    (25, 15, 25), (35, 25, 35), (50, 35, 50), (75, 50, 75),
    (100, 75, 100), (150, 100, 150), (200, 150, 200), (300, 200, 300),
    (400, 300, 400), (500, 400, 500), (600, 500, 600), (800, 600, 800),
    (1000, 800, 1000),
]
_BASIC2 = [
    (75, 50, 75), (100, 75, 100), (150, 100, 150), (200, 150, 200),
    (300, 200, 300), (400, 300, 400), (500, 400, 500), (600, 500, 600),
    (800, 600, 800), (1000, 800, 1000),
]
_ACCEL2 = [
    (50, None, 8), (75, None, 13), (100, None, 20), (150, 20, 30),
    (200, 30, 45), (300, 45, 75), (400, 75, 110), (500, 110, 150),
    (600, 150, 200), (800, 200, 300), (1000, 300, 450),
]
_ACCEL3_F1 = [
    (75, None, 2), (100, None, 3), (150, None, 4), (200, None, 5),
    (300, None, 8), (400, None, 12), (500, None, 15), (600, None, 19),
    (800, None, 27), (1000, None, 35),
]
_ACCEL3_F2 = [
    (100, None, 5), (150, None, 10), (200, None, 20), (300, None, 37),
    (400, None, 55), (500, None, 80), (600, None, 105), (800, None, 155),
    (1000, None, 205),
]

METHODS = {
    "basic1": {
        "title": "Первый базовый",
        "group": "1",
        "exposure": "water",
        "note": "Образцы насыщают водой, замораживают на воздухе и оттаивают в воде. Марка F1.",
        "medium": "вода",
        "marks": _BASIC1,
    },
    "basic2": {
        "title": "Второй базовый",
        "group": "2",
        "exposure": "mineralized",
        "note": "Насыщение и оттаивание в 5 % растворе NaCl, замораживание на воздухе. Марка F2 для дорожных и аэродромных покрытий и минерализованной воды.",
        "medium": "5 % раствор NaCl",
        "marks": _BASIC2,
    },
    "accel2": {
        "title": "Второй ускоренный",
        "group": "1",
        "exposure": "mineralized",
        "note": "Ускоренное испытание в 5 % растворе NaCl при замораживании на воздухе. Марка F1. Не для дорожных покрытий и лёгких бетонов ниже D1500.",
        "medium": "5 % раствор NaCl",
        "marks": _ACCEL2,
    },
    "accel3": {
        "title": "Третий ускоренный",
        "group": None,
        "exposure": None,
        "note": "Замораживание в 5 % растворе NaCl при минус (50±2) °C. F1 — обычные условия, F2 — покрытия и минерализованная вода.",
        "medium": "5 % раствор NaCl",
        "marks_by_exposure": {
            "water": _ACCEL3_F1,
            "mineralized": _ACCEL3_F2,
        },
    },
}


def mark_label(group: str, mark: int) -> str:
    return f"F{group}{mark}"


def marks_for(method: str, exposure: str) -> tuple[str, list[tuple[int, int | None, int]]]:
    spec = METHODS.get(method)
    if spec is None:
        raise ValueError("Неизвестный метод испытания")
    if method == "accel3":
        if exposure not in ("water", "mineralized"):
            raise ValueError("Для третьего метода укажите условия: вода или минерализованная среда")
        group = "1" if exposure == "water" else "2"
        return group, spec["marks_by_exposure"][exposure]
    fixed = spec["exposure"]
    if exposure != fixed:
        raise ValueError("Среда насыщения не соответствует выбранному методу")
    return spec["group"], spec["marks"]


def catalog() -> dict:
    methods = []
    for key, spec in METHODS.items():
        if key == "accel3":
            exposures = {
                name: [
                    {"mark": m, "intermediate": inter, "final": final, "label": mark_label("1" if name == "water" else "2", m)}
                    for m, inter, final in rows
                ]
                for name, rows in spec["marks_by_exposure"].items()
            }
            group = None
        else:
            exposures = {
                spec["exposure"]: [
                    {"mark": m, "intermediate": inter, "final": final, "label": mark_label(spec["group"], m)}
                    for m, inter, final in spec["marks"]
                ]
            }
            group = spec["group"]
        methods.append({
            "id": key,
            "title": spec["title"],
            "group": group,
            "note": spec["note"],
            "medium": spec["medium"],
            "exposures": exposures,
        })
    return {
        "methods": methods,
        "regimes": {
            "air_freeze": {
                "100": {"freeze_c": -18, "freeze_tol": 2, "freeze_h_min": 2.5, "thaw_c": 20, "thaw_tol": 2, "thaw_h": 2, "thaw_tol_h": 0.5},
                "150": {"freeze_c": -18, "freeze_tol": 2, "freeze_h_min": 3.5, "thaw_c": 20, "thaw_tol": 2, "thaw_h": 3, "thaw_tol_h": 0.5},
            },
            "salt_freeze": {
                "100": {"freeze_c_min": -55, "freeze_c_max": -48, "freeze_h_min": 2.5, "thaw_c": 20, "thaw_tol": 2, "thaw_h_min": 2.5},
                "150": {"freeze_c_min": -55, "freeze_c_max": -48, "freeze_h_min": 2.5, "thaw_c": 20, "thaw_tol": 2, "thaw_h_min": 3.5},
            },
        },
    }


def _series(values: list[float], title: str) -> dict:
    n = len(values)
    if n not in STUDENT_T:
        raise ValueError(f"{title}: нужно 4, 5 или 6 образцов (таблица 7)")
    if any(v <= 0 for v in values):
        raise ValueError(f"{title}: прочность должна быть больше нуля")
    mean = sum(values) / n
    sigma = (max(values) - min(values)) / RANGE_ALPHA[n]
    variation = sigma / mean
    xmin = mean - STUDENT_T[n] * sigma
    return {
        "n": n,
        "mean": mean,
        "sigma": sigma,
        "variation": variation,
        "xmin": xmin,
    }


def regime_ok(method: str, size: int, freeze_temp: float, freeze_hours: float, thaw_temp: float, thaw_hours: float) -> bool:
    if size not in (100, 150):
        raise ValueError("Размер образца: 100 или 150 мм")
    thaw_temp_ok = abs(thaw_temp - 20) <= 2
    if method == "accel3":
        temp_ok = -55 <= freeze_temp <= -48
        thaw_min = 2.5 if size == 100 else 3.5
        return temp_ok and freeze_hours >= 2.5 and thaw_temp_ok and thaw_hours >= thaw_min
    temp_ok = abs(freeze_temp - (-18)) <= 2
    if size == 100:
        time_ok = freeze_hours >= 2.5 and abs(thaw_hours - 2) <= 0.5
    else:
        time_ok = freeze_hours >= 3.5 and abs(thaw_hours - 3) <= 0.5
    return temp_ok and time_ok and thaw_temp_ok


def evaluate(data: dict) -> dict:
    method = data["method"]
    exposure = data["exposure"]
    group, table = marks_for(method, exposure)
    project = int(data["project_mark"])
    row = next((item for item in table if item[0] == project), None)
    if row is None:
        raise ValueError("Такой марки нет в таблице 4 для выбранного метода")

    control = _series(list(data["control_strengths"]), "Контрольные образцы")
    main = _series(list(data["main_strengths"]), "Основные образцы")
    before = list(data["mass_before_g"])
    after = list(data["mass_after_g"])
    if len(before) != len(after) or len(before) != len(data["main_strengths"]):
        raise ValueError("Масса до и после нужна для каждого основного образца")
    if any(m <= 0 for m in before):
        raise ValueError("Масса образца должна быть больше нуля")
    losses = [(b - a) / b * 100 for b, a in zip(before, after)]
    mass_loss = sum(losses) / len(losses)

    variation_ok = control["variation"] <= 0.09 and main["variation"] <= 0.09
    spread = data.get("density_spread_kg_m3")
    density_ok = spread is None or spread <= 25
    series_valid = variation_ok and density_ok

    lightweight = bool(data.get("lightweight")) and method == "basic1" and project <= 50
    if lightweight:
        drop = (control["mean"] - main["mean"]) / control["mean"] * 100
        strength_ok = drop <= 15
    else:
        drop = None
        strength_ok = main["xmin"] >= 0.9 * control["xmin"]

    mass_ok = mass_loss <= 2
    surface_forbidden = bool(data.get("decorative_surface")) or exposure == "mineralized" or method == "basic2"
    defects_ok = not (
        data.get("cracks") or data.get("chips") or data.get("edge_scaling")
        or (data.get("surface_scaling") and surface_forbidden)
    )
    mode_ok = regime_ok(
        method,
        int(data["sample_size_mm"]),
        float(data["freeze_temp_c"]),
        float(data["freeze_hours"]),
        float(data["thaw_temp_c"]),
        float(data["thaw_hours"]),
    )
    cycles = int(data["cycles_done"])
    criteria = series_valid and strength_ok and mass_ok and defects_ok and mode_ok
    achieved = None
    if criteria:
        confirmed = [mark for mark, _inter, final in table if cycles >= final]
        if confirmed:
            achieved = mark_label(group, max(confirmed))
    project_met = achieved is not None and int(achieved[2:]) >= project and achieved[1] == group

    reasons = []
    if not variation_ok:
        reasons.append("коэффициент вариации серии выше 9 % — серию снимают с испытаний")
    if not density_ok:
        reasons.append("разброс плотности больше ±25 кг/м³ от средней")
    if series_valid and not strength_ok:
        if lightweight:
            reasons.append("снижение средней прочности лёгкого бетона больше 15 %")
        else:
            reasons.append("нижняя граница прочности основных образцов ниже 0,9 границы контрольных")
    if not mass_ok:
        reasons.append("средняя потеря массы больше 2 %")
    if not defects_ok:
        reasons.append("есть трещины, сколы или шелушение")
    if not mode_ok:
        reasons.append("температура или длительность цикла не соответствует режиму метода")
    if criteria and not project_met:
        reasons.append("критерий выполнен, но циклов меньше, чем для заявленной марки")

    label = mark_label(group, project)
    if project_met:
        conclusion = f"Бетон соответствует марке {label} по ГОСТ 10060-2012. Подтверждённая марка: {achieved}."
    elif achieved:
        conclusion = f"Заявленная марка {label} не подтверждена. По числу выдержанных циклов марка {achieved}."
    else:
        conclusion = f"Бетон не соответствует марке {label}. " + "; ".join(reasons)

    return {
        "mark_group": group,
        "x_cp_control": round(control["mean"], 2),
        "x_cp_main": round(main["mean"], 2),
        "sigma_control": round(control["sigma"], 3),
        "sigma_main": round(main["sigma"], 3),
        "v_control_pct": round(control["variation"] * 100, 2),
        "v_main_pct": round(main["variation"] * 100, 2),
        "x_min_control": round(control["xmin"], 2),
        "x_min_main": round(main["xmin"], 2),
        "limit_09": round(0.9 * control["xmin"], 2),
        "strength_drop_pct": None if drop is None else round(drop, 2),
        "mass_loss_pct": round(mass_loss, 2),
        "series_valid": series_valid,
        "strength_ok": strength_ok,
        "mass_ok": mass_ok,
        "defects_ok": defects_ok,
        "regime_ok": mode_ok,
        "achieved_mark": achieved,
        "project_mark_met": project_met,
        "conclusion": conclusion[:500],
    }
