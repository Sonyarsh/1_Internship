import uvicorn
from fastapi import FastAPI
from database import engine, Base
from routers import router
import models  # Импортируем модели, чтобы Base о них узнал

# Создаем таблицы в базе данных
Base.metadata.create_all(bind=engine)

# Создаем экземпляр FastAPI
app = FastAPI(title="Concrete Strength API")

# Подключаем роутер по префиксу /concrete_strength
app.include_router(router, prefix='/concrete_strength', tags=["Concrete Strength"])

# Основной эндпоинт
@app.get("/")
def read_root():
    return {"Hello": "World"}

# Запуск сервера
if __name__ == '__main__':
    uvicorn.run("main:app", host='127.0.0.1', port=8080, reload=True)



from fastapi import FastAPI
from routers import router


app = FastAPI(
    title="Concrete Strength API"
)

app.include_router(router)