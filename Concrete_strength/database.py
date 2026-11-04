import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# .env лежит рядом с этим файлом (Concrete_strength/.env)
load_dotenv(Path(__file__).resolve().parent / ".env")

# Пример:
# DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/concrete_strength_db
DB_URL = os.getenv("DATABASE_URL", "").strip()

if not DB_URL:
    raise RuntimeError(
        "Не задан DATABASE_URL. Создайте файл Concrete_strength/.env "
        "по образцу .env.example"
    )

if DB_URL.startswith("sqlite"):
    engine = create_engine(
        DB_URL,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL (и другие): connect_args для SQLite не нужны
    engine = create_engine(DB_URL)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)
Base = declarative_base()


def get_session():
    """Dependency FastAPI: одна сессия БД на запрос."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
