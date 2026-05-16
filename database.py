from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# URL базы данных (можете заменить на другую БД, например PostgreSQL)
DB_URL = 'sqlite:///./concrete_strength.db'

# Создание engine
engine = create_engine(DB_URL)

# Фабрика сессий
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Функция получения сессии
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()