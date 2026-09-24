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
        "*",  # Allow all for development & deployed frontend
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi.exceptions import ResponseValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger("uvicorn.error")

@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(request, exc: ResponseValidationError):
    logger.error(f"[CORS-Safe] Response validation error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Response validation error", "errors": [str(e) for e in exc.errors()]},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc: Exception):
    logger.error(f"[CORS-Safe] Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
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
