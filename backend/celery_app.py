import os
from celery import Celery

celery = Celery(
    "weathergpt",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery.task
def fetch_weather_task(latitude: float, longitude: float):
    from services.openmeteo import fetch_weather
    return fetch_weather(latitude, longitude)
