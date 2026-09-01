from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from database import engine, Base
from routers import health, location, weather, ai, websocket

app = FastAPI(title="WeatherGPT API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",  # Allow all for development
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    # Attempt to create tables on startup
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables verified successfully.")
    except Exception as e:
        print(f"Database connection warning on startup: {e}")


app.include_router(health.router)
app.include_router(location.router)
app.include_router(weather.router)
app.include_router(ai.router)
app.include_router(websocket.router)
