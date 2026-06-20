# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy.ext.declarative import declarative_base

# # URL базы данных SQLite (как указано в README.md)
# DB_URL = 'sqlite:///./concrete_strength.db'

# # Создание engine
# engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

# # Фабрика сессий
# SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

# # Базовый класс для моделей
# Base = declarative_base()

# # Функция получения сессии
# def get_session():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()




from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# URL базы данных PostgreSQL
DB_URL = 'postgresql://username:password@localhost:5432/mydatabase'

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

