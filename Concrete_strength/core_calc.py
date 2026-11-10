"""Прочность на сжатие по образцам из конструкций — ГОСТ 28570-2019.

R_обр = F / A  (п. 9.1, формула 1)
R = R_обр · α · η₁  (п. 9.2, формула 5)

η₁ — по отношению h/d для цилиндров (таблица 2); для куба η₁ = 1.
α — масштабный коэффициент: куб — таблица 4, цилиндр — таблица 5.
Прочность серии — среднее арифметическое (п. 9.3).
"""

from __future__ import annotations

import math

# Таблица 2: h/d → η1 (сжатие цилиндров)
ETA1_TABLE = [
    (0.65, 0.74, 0.88),
    (0.75, 0.84, 0.92),
    (0.85, 0.94, 0.96),
    (0.95, 1.04, 1.00),
    (1.05, 1.14, 1.04),
    (1.15, 1.24, 1.08),
    (1.25, 1.34, 1.10),
    (1.35, 1.44, 1.12),
    (1.45, 1.54, 1.13),
    (1.55, 1.64, 1.14),
    (1.65, 1.74, 1.16),
    (1.75, 1.84, 1.18),
    (1.85, 1.94, 1.19),
    (1.95, 2.05, 1.20),
]

# Таблица 4: ребро куба → α (сжатие, все виды бетонов)
CUBE_ALPHA = {70: 0.85, 100: 0.95, 150: 1.00, 200: 1.05}


def catalog() -> dict:
    return {
        "tnpa": "ГОСТ 28570-2019",
        "related": "ГОСТ 10180-2012 (схемы испытания)",
        "title": "Сжатие образцов, отобранных из конструкций",
        "note": (
            "Керны (цилиндры) или кубы из конструкций. "
            "Прочность образца R = (F/A)·α·η₁ с приведением к базовому кубу 150 мм. "
            "Прочность серии — среднее по образцам."
        ),
        "shapes": ["cylinder", "cube"],
        "eta1_table": [
            {"hd_from": a, "hd_to": b, "eta1": e} for a, b, e in ETA1_TABLE
        ],
        "cube_alpha": CUBE_ALPHA,
        "cylinder_alpha_note": (
            "Таблица 5: Ø50±6 → 0,85; Ø63±6 → 0,90; Ø80±10 → 0,95; Ø>90 → 1,00"
        ),
    }


def eta1_for_hd(hd: float) -> float:
    if hd < 0.65 - 1e-9 or hd > 2.05 + 1e-9:
        raise ValueError("Для цилиндра отношение h/d должно быть от 0,65 до 2,05 (п. 4.2)")
    for lo, hi, eta in ETA1_TABLE:
        if lo - 1e-9 <= hd <= hi + 1e-9:
            return eta
    # на границах между интервалами — ближайший
    for lo, hi, eta in ETA1_TABLE:
        if hd < lo:
            return eta
    return ETA1_TABLE[-1][2]


def cube_alpha(edge_mm: float) -> float:
    """Ближайший типоразмер таблицы 4."""
    sizes = sorted(CUBE_ALPHA.keys())
    best = min(sizes, key=lambda s: abs(s - edge_mm))
    if abs(best - edge_mm) > 15:
        raise ValueError(
            "Ребро куба должно быть близко к 70, 100, 150 или 200 мм (таблица 4)"
        )
    return CUBE_ALPHA[best]


def cylinder_alpha(diameter_mm: float) -> float:
    """Таблица 5 ГОСТ 28570-2019."""
    d = diameter_mm
    if 44 <= d <= 56:  # 50±6
        return 0.85
    if 57 <= d <= 69:  # 63±6
        return 0.90
    if 70 <= d <= 90:  # 80±10
        return 0.95
    if 90 < d <= 200:
        return 1.00
    raise ValueError("Диаметр цилиндра должен быть от 44 до 200 мм (п. 4.2)")


def evaluate_sample(sample: dict) -> dict:
    shape = sample["shape"]
    # F вводим в кН — переводим в Н
    force_kn = float(sample["force_kn"])
    if force_kn <= 0:
        raise ValueError("Разрушающее усилие F должно быть больше 0")
    force_n = force_kn * 1000.0

    if shape == "cube":
        edge = float(sample["edge_mm"])
        if edge <= 0:
            raise ValueError("Ребро куба должно быть больше 0")
        area = edge * edge  # мм²
        alpha = cube_alpha(edge)
        eta1 = 1.0
        hd = None
        diameter = None
        height = edge
    elif shape == "cylinder":
        diameter = float(sample["diameter_mm"])
        height = float(sample["height_mm"])
        if diameter <= 0 or height <= 0:
            raise ValueError("Диаметр и высота цилиндра должны быть больше 0")
        hd = height / diameter
        area = math.pi * (diameter / 2) ** 2
        alpha = cylinder_alpha(diameter)
        eta1 = eta1_for_hd(hd)
        edge = None
    else:
        raise ValueError("Форма образца: cube или cylinder")

    r_obr = force_n / area  # МПа
    r = r_obr * alpha * eta1
    return {
        "area_mm2": round(area, 2),
        "alpha": alpha,
        "eta1": eta1,
        "hd_ratio": round(hd, 3) if hd is not None else None,
        "r_obr_mpa": round(r_obr, 1),
        "r_mpa": round(r, 1),
        "edge_mm": edge,
        "diameter_mm": diameter,
        "height_mm": height,
    }


def evaluate(payload: dict) -> dict:
    samples = payload.get("samples") or []
    if len(samples) < 1:
        raise ValueError("Добавьте хотя бы один образец")
    if len(samples) > 20:
        raise ValueError("Слишком много образцов в одном протоколе")

    computed = []
    for i, s in enumerate(samples, start=1):
        try:
            computed.append(evaluate_sample(s))
        except ValueError as exc:
            raise ValueError(f"Образец {i}: {exc}") from exc

    strengths = [c["r_mpa"] for c in computed]
    series_avg = round(sum(strengths) / len(strengths), 1)

    return {
        "sample_results": computed,
        "series_strength_mpa": series_avg,
        "samples_count": len(computed),
        "conclusion": (
            f"ГОСТ 28570-2019: испытано {len(computed)} обр., "
            f"средняя прочность серии (к базовому кубу 150 мм) = {series_avg} МПа."
        ),
    }
