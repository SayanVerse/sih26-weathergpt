from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timezone
import asyncio

from services.openweather import (
    fetch_current_weather, 
    fetch_timeline_formatted_1h, 
    fetch_timeline_formatted_daily, 
    fetch_timeline_1min, 
    fetch_timeline_15min, 
    fetch_timeline_1h, 
    fetch_alert_details
)
from services.geocoding import reverse_geocode
from services.weather_intelligence import generate_weather_signals
from redis_cache import get_cached_weather, set_cached_weather
from schemas.weather import (
    CurrentWeatherResponse,
    HourlyForecastResponse,
    DailyForecastResponse,
    WeatherAlertsResponse
)

router = APIRouter(tags=["Weather"])

# ─────────────────────────────────────────────────────────────────────────────
# Internal: shared cached fetch (formatted for frontend)
# ─────────────────────────────────────────────────────────────────────────────
async def _get_formatted_weather(lat: float, lon: float, location_meta: dict = None) -> dict:
    """
    Fetch weather data from OpenWeather using concurrent requests.
    Cache key includes lat/lon rounded to 4 decimal places.
    """
    cache_key = f"weather:ow_formatted:{lat:.4f}:{lon:.4f}"
    cached = await get_cached_weather(cache_key)
    if cached:
        return cached

    try:
        current_name = location_meta.get("name", "") if location_meta else ""
        if not current_name or current_name == "Current Location" or current_name == "Local Area":
            location_meta = await reverse_geocode(lat, lon)

        # Run OpenWeather requests concurrently
        current_task = fetch_current_weather(lat, lon, location_meta)
        hourly_task = fetch_timeline_formatted_1h(lat, lon)
        daily_task = fetch_timeline_formatted_daily(lat, lon)
        
        current_res, hourly_list, daily_list = await asyncio.gather(current_task, hourly_task, daily_task)

        data = {
            "location": current_res["current"]["location"],
            "current": current_res["current"],
            "hourly": hourly_list,
            "daily": daily_list,
            "alerts": current_res.get("alerts", [])
        }
        await set_cached_weather(cache_key, data, expire_seconds=900)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather: {str(e)}")


async def _get_raw_weather(lat: float, lon: float) -> dict:
    """Legacy endpoint placeholder, now returns formatted weather."""
    return await _get_formatted_weather(lat, lon)

# ─────────────────────────────────────────────────────────────────────────────
# Weather — Frontend-compatible endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/api/weather/current", response_model=CurrentWeatherResponse)
async def get_weather_current(lat: float, lon: float,
                               name: Optional[str] = None,
                               country: Optional[str] = None,
                               region: Optional[str] = None,
                               timezone: Optional[str] = None):
    """
    GET /api/weather/current?lat=&lon=
    Returns CurrentWeatherResponse shape expected by frontend.
    Optional location metadata params: name, country, region, timezone.
    """
    location_meta = None
    if name:
        location_meta = {
            "name": name,
            "country": country or "",
            "region": region or "",
            "latitude": lat,
            "longitude": lon,
            "timezone": timezone,
        }
    
    print(f"[API] Fetching current weather for Location: {name or 'Unknown'} | Lat: {lat:.4f}, Lon: {lon:.4f}")
    
    # Use OpenWeather for current conditions
    data = await fetch_current_weather(lat, lon, location_meta)
    return data["current"]


@router.get("/api/weather/hourly", response_model=HourlyForecastResponse)
async def get_weather_hourly(lat: float, lon: float,
                              name: Optional[str] = None,
                              country: Optional[str] = None,
                              region: Optional[str] = None):
    """
    GET /api/weather/hourly?lat=&lon=
    Returns HourlyForecastResponse shape: { location, hourly: [...] }
    """
    location_meta = None
    if name:
        location_meta = {
            "name": name,
            "country": country or "",
            "region": region or "",
            "latitude": lat,
            "longitude": lon,
        }
    print(f"[API] Fetching hourly forecast for Location: {name or 'Unknown'} | Lat: {lat:.4f}, Lon: {lon:.4f}")
    data = await _get_formatted_weather(lat, lon, location_meta)
    # Return correct schema: {location, hourly: [...]}
    return {"location": data["location"], "hourly": data["hourly"]}


@router.get("/api/weather/forecast", response_model=DailyForecastResponse)
async def get_weather_forecast(lat: float, lon: float,
                                name: Optional[str] = None,
                                country: Optional[str] = None,
                                region: Optional[str] = None):
    """
    GET /api/weather/forecast?lat=&lon=
    Frontend-compatible daily forecast — returns DailyForecastResponse shape:
    { location, forecast: [...] }
    """
    location_meta = None
    if name:
        location_meta = {
            "name": name,
            "country": country or "",
            "region": region or "",
            "latitude": lat,
            "longitude": lon,
        }
    print(f"[API] Fetching daily forecast for Location: {name or 'Unknown'} | Lat: {lat:.4f}, Lon: {lon:.4f}")
    data = await _get_formatted_weather(lat, lon, location_meta)
    # Return correct schema: {location, forecast: [...]}
    return {"location": data["location"], "forecast": data["daily"]}


@router.get("/api/weather/daily")
async def get_weather_daily(lat: float, lon: float):
    """
    Legacy /api/weather/daily — returns raw backend daily list.
    Use /api/weather/forecast for frontend-compatible shape.
    """
    data = await _get_raw_weather(lat, lon)
    return data.get("daily")


@router.get("/api/weather/complete")
async def get_weather_complete(lat: float, lon: float):
    """Full weather blob in original backend format."""
    return await _get_raw_weather(lat, lon)


@router.get("/api/weather/alerts", response_model=WeatherAlertsResponse)
async def get_weather_alerts(lat: float, lon: float, name: Optional[str] = None):
    """
    GET /api/weather/alerts?lat=&lon=
    Returns WeatherAlertsResponse shape: { location, alerts: [] }
    Uses AI deterministic signals to generate alerts if severe weather is detected.
    """
    location_meta = {"name": name, "latitude": lat, "longitude": lon} if name else None
    data = await _get_formatted_weather(lat, lon, location_meta)
    
    current = data.get("current", {})
    # daily and hourly are plain lists inside the formatted data blob
    daily_list = data.get("daily", [])
    hourly_list = data.get("hourly", [])
    
    signals = generate_weather_signals(current, daily_list, hourly_list)
    alerts_list = []
    
    now_iso = datetime.now(timezone.utc).isoformat()
    
    for i, s in enumerate(signals):
        if s.get("severity") == "high":
            alerts_list.append({
                "id": f"alert-{i}",
                "severity": s.get("severity", "high"),
                "title": s.get("title", "Weather Alert"),
                "headline": s.get("title", "Weather Alert"),
                "description": s.get("description", ""),
                "instruction": "Please take necessary precautions.",
                "effective": now_iso,
                "expires": now_iso, # Simplified expiration
                "source": "WeatherGPT Intelligence",
                "areas": [current.get("location", {}).get("name", "Local Area")]
            })

    return {
        "location": current.get("location", {
            "name": f"Lat {lat:.2f}, Lon {lon:.2f}",
            "country": "Unknown",
            "latitude": lat,
            "longitude": lon,
        }),
        "alerts": alerts_list
    }

# ─────────────────────────────────────────────────────────────────────────────
# OpenWeather Timeline Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/api/weather/timeline/1min")
async def get_timeline_1min(lat: float, lon: float):
    return await fetch_timeline_1min(lat, lon)

@router.get("/api/weather/timeline/15min")
async def get_timeline_15min(lat: float, lon: float):
    return await fetch_timeline_15min(lat, lon)

@router.get("/api/weather/timeline/1h")
async def get_timeline_1h(lat: float, lon: float):
    return await fetch_timeline_1h(lat, lon)

@router.get("/api/weather/alerts/{alert_id}")
async def get_alert_details_endpoint(alert_id: str):
    return await fetch_alert_details(alert_id)
