import uvicorn
from fastapi import FastAPI
from database import engine, Base
from routers import router

# Создаем таблицы в базе данных
Base.metadata.create_all(bind=engine)

# Создаем экземпляр FastAPI
app = FastAPI()

# Подключаем роутер по префиксу /concrete_strength
app.include_router(router, prefix='/concrete_strength')

# Основной эндпоинт
@app.get("/")
def read_root():
    return {"Hello": "World"}

# Запуск сервера
if __name__ == '__main__':
    uvicorn.run("main:app", host='127.0.0.1', port=8080, reload=True)