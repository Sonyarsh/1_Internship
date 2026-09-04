from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Для учёбы используем SQLite — файл создаётся рядом с проектом.
# Когда будете готовы к PostgreSQL, замените DB_URL на:
# postgresql://USER:PASSWORD@localhost:5432/DB_NAME
DB_URL = "sqlite:///./concrete_strength.db"

engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False},  # нужно только для SQLite
)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)
Base = declarative_base()


def get_session():
    """Dependency FastAPI: одна сессия БД на запрос."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
