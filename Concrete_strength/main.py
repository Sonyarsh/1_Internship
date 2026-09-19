import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from database import engine, Base
from auth_router import router as auth_router
from routers import router as concrete_router
from contact_router import router as contact_router
import user_model  # таблица users
import models  # таблица concrete_strengths
import contact_model  # таблица contact_requests


def ensure_tables():
    """Создаёт таблицы и добавляет user_id, если колонки ещё нет."""
    insp = inspect(engine)
    if "concrete_strengths" in insp.get_table_names():
        column_names = {col["name"] for col in insp.get_columns("concrete_strengths")}
        if "applicant_info" not in column_names:
            models.ConcreteStrength.__table__.drop(bind=engine)
        elif "user_id" not in column_names:
            with engine.begin() as conn:
                conn.exec_driver_sql(
                    "ALTER TABLE concrete_strengths ADD COLUMN user_id INTEGER"
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


@app.get("/")
def read_root():
    return {"status": "ok", "docs": "/docs"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=False)
