import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from database import engine, Base
from auth_router import router as auth_router
from routers import router as concrete_router
from contact_router import router as contact_router
from frost_router import router as frost_router
from waterproof_router import router as waterproof_router
from core_router import router as core_router
import user_model  # таблица users
import models  # таблица concrete_strengths
import contact_model  # таблица contact_requests
import frost_model  # таблица frost_tests
import waterproof_model  # таблица waterproof_tests
import core_model  # таблица core_strength_tests


def ensure_tables():
    """Создаёт таблицы и добавляет недостающие колонки."""
    insp = inspect(engine)
    tables = insp.get_table_names()

    if "concrete_strengths" in tables:
        column_names = {col["name"] for col in insp.get_columns("concrete_strengths")}
        if "applicant_info" not in column_names:
            models.ConcreteStrength.__table__.drop(bind=engine)
        elif "user_id" not in column_names:
            with engine.begin() as conn:
                conn.exec_driver_sql(
                    "ALTER TABLE concrete_strengths ADD COLUMN user_id INTEGER"
                )

    if "users" in tables:
        user_columns = {col["name"] for col in insp.get_columns("users")}
        if "phone" not in user_columns:
            with engine.begin() as conn:
                conn.exec_driver_sql(
                    "ALTER TABLE users ADD COLUMN phone VARCHAR(30)"
                )

    if "waterproof_tests" in tables:
        wp_columns = {col["name"] for col in insp.get_columns("waterproof_tests")}
        with engine.begin() as conn:
            if "sample_diameters_mm" not in wp_columns:
                conn.exec_driver_sql(
                    "ALTER TABLE waterproof_tests ADD COLUMN sample_diameters_mm JSON"
                )
            # Старое одно поле диаметра больше не используется
            if "sample_diameter_mm" in wp_columns:
                conn.exec_driver_sql(
                    "ALTER TABLE waterproof_tests ALTER COLUMN sample_diameter_mm DROP NOT NULL"
                )

    Base.metadata.create_all(bind=engine)


ensure_tables()

app = FastAPI(title="Concrete Strength API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5180",
        "http://127.0.0.1:5180",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(
    concrete_router,
    prefix="/concrete_strength",
    tags=["Concrete Strength"],
)
app.include_router(
    contact_router,
    prefix="/contact_requests",
    tags=["Contact Requests"],
)
app.include_router(
    frost_router,
    prefix="/frost_resistance",
    tags=["Frost Resistance"],
)
app.include_router(
    waterproof_router,
    prefix="/waterproof",
    tags=["Waterproof (wet spot)"],
)
app.include_router(
    core_router,
    prefix="/core_strength",
    tags=["Core strength GOST 28570"],
)


@app.get("/")
def read_root():
    return {"status": "ok", "docs": "/docs"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=False)
