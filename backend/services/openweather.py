import os
import httpx
from fastapi import HTTPException
from datetime import datetime, timezone
import math

def get_api_key():
    key = os.environ.get("OPEN_WEATHER", "").strip()
    if not key:
        raise HTTPException(status_code=500, detail="OpenWeather API key is not configured.")
    return key

# Full mapping of all OWM icon codes to frontend icon identifiers
def map_icon(ow_icon: str) -> str:
    mapping = {
        "01d": "clear-day",
        "01n": "clear-night",
        "02d": "partly-cloudy-day",
        "02n": "partly-cloudy-night",
        "03d": "cloudy",
        "03n": "cloudy",
        "04d": "overcast",
        "04n": "overcast",
        "09d": "drizzle",
        "09n": "drizzle",
        "10d": "rain",
        "10n": "rain",
        "11d": "thunderstorm",
        "11n": "thunderstorm",
        "13d": "snow",
        "13n": "snow",
        "50d": "fog",
        "50n": "fog"
    }
    return mapping.get(ow_icon, "cloudy")

# Map OWM weather id codes to precise human-readable conditions
# Based on: https://openweathermap.org/weather-conditions
def map_condition_from_id(weather_id: int, icon: str) -> str:
    """
    Returns a clean, accurate condition string based on OWM weather code.
    OWM `main` field is too coarse (e.g., "Clouds" for both partly cloudy and overcast).
    OWM `description` field is better but not title-cased or standardized.
    This function gives the best of both worlds.
    """
    is_day = icon.endswith("d") if icon else True

    # Thunderstorm group (2xx)
    if 200 <= weather_id <= 202:
        return "Thunderstorm with Rain"
    if 210 <= weather_id <= 221:
        return "Thunderstorm"
    if 230 <= weather_id <= 232:
        return "Thunderstorm with Drizzle"

    # Drizzle group (3xx)
    if weather_id in (300, 310):
        return "Light Drizzle"
    if weather_id in (301, 311):
        return "Drizzle"
    if weather_id in (302, 312):
        return "Heavy Drizzle"
    if weather_id in (313, 321):
        return "Showers"
    if weather_id == 314:
        return "Heavy Showers"

    # Rain group (5xx)
    if weather_id == 500:
        return "Light Rain"
    if weather_id == 501:
        return "Moderate Rain"
    if weather_id in (502, 503, 504):
        return "Heavy Rain"
    if weather_id == 511:
        return "Freezing Rain"
    if weather_id in (520, 521):
        return "Light Showers"
    if weather_id == 522:
        return "Heavy Showers"
    if weather_id == 531:
        return "Shower Bursts"

    # Snow group (6xx)
    if weather_id == 600:
        return "Light Snow"
    if weather_id == 601:
        return "Snow"
    if weather_id == 602:
        return "Heavy Snow"
    if weather_id == 611:
        return "Sleet"
    if weather_id in (612, 613):
        return "Light Sleet"
    if weather_id in (615, 616):
        return "Rain and Snow"
    if weather_id in (620, 621):
        return "Light Snow Showers"
    if weather_id == 622:
        return "Heavy Snow Showers"

    # Atmosphere group (7xx)
    if weather_id == 701:
        return "Mist"
    if weather_id == 711:
        return "Smoke"
    if weather_id == 721:
        return "Haze"
    if weather_id == 731:
        return "Sand/Dust Whirls"
    if weather_id == 741:
        return "Foggy"
    if weather_id == 751:
        return "Sand"
    if weather_id == 761:
        return "Dust"
    if weather_id == 762:
        return "Volcanic Ash"
    if weather_id == 771:
        return "Squalls"
    if weather_id == 781:
        return "Tornado"

    # Clear (800)
    if weather_id == 800:
        return "Clear Sky" if is_day else "Clear Night"

    # Clouds (80x)
    if weather_id == 801:
        return "Mostly Clear" if is_day else "Mostly Clear Night"
    if weather_id == 802:
        return "Partly Cloudy"
    if weather_id == 803:
        return "Mostly Cloudy"
    if weather_id == 804:
        return "Overcast"

    return "Unknown"


def _safe_float(val, precision=1):
    if val is None:
        return 0.0
    try:
        if math.isnan(val):
            return 0.0
        return round(float(val), precision)
    except Exception:
        return 0.0

def format_timestamp(ts: int) -> str:
    if not ts:
        return ""
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()

def _calc_daylight_hours(sunrise_ts: int, sunset_ts: int) -> float:
    """Calculate daylight hours from unix timestamps."""
    if not sunrise_ts or not sunset_ts:
        return 12.0
    return round((sunset_ts - sunrise_ts) / 3600.0, 1)

async def fetch_current_weather(lat: float, lon: float, location_meta: dict = None) -> dict:
    url = "https://api.openweathermap.org/data/4.0/onecall/current"
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": get_api_key()
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail={"code": "WEATHER_API_ERROR", "message": f"OpenWeather API error: {response.status_code}"}
            )
        data = response.json()
    
    if not data.get("data") or len(data["data"]) == 0:
        raise HTTPException(status_code=500, detail="OpenWeather returned empty data array.")
    
    current_data = data["data"][0]
    weather_info = current_data.get("weather", [{}])[0]
    
    location_obj = {
        "name": (location_meta or {}).get("name") or f"{lat:.4f}, {lon:.4f}",
        "region": (location_meta or {}).get("region", ""),
        "country": (location_meta or {}).get("country", "Unknown"),
        "latitude": float(lat),
        "longitude": float(lon),
        "timezone": data.get("timezone", "UTC")
    }
    
    ow_icon = weather_info.get("icon", "01d")
    weather_id = weather_info.get("id", 800)
    is_day = ow_icon.endswith("d")
    
    current_formatted = {
        "location": location_obj,
        "temperature": _safe_float(current_data.get("temp")),
        "feels_like": _safe_float(current_data.get("feels_like")),
        # Use precise condition mapping instead of raw OWM "main" field
        "condition": map_condition_from_id(weather_id, ow_icon),
        # description is the OWM description, title-cased for display
        "description": weather_info.get("description", "").title(),
        "humidity": _safe_float(current_data.get("humidity")),
        "pressure": _safe_float(current_data.get("pressure")),
        "wind_speed": _safe_float(current_data.get("wind_speed")),
        "wind_direction": _safe_float(current_data.get("wind_deg")),
        "wind_gust": _safe_float(current_data.get("wind_gust")),
        # Visibility is in metres from OWM, convert to km
        "visibility": _safe_float(current_data.get("visibility", 10000) / 1000.0),
        "uv_index": _safe_float(current_data.get("uvi")),
        "cloud_cover": _safe_float(current_data.get("clouds")),
        "dew_point": _safe_float(current_data.get("dew_point")),
        "icon": map_icon(ow_icon),
        "timestamp": format_timestamp(current_data.get("dt")),
        "is_day": is_day,
        "sunrise": format_timestamp(current_data.get("sunrise")),
        "sunset": format_timestamp(current_data.get("sunset")),
        "air_quality_index": 0.0  # OWM One Call 3.0 doesn't include AQI; would need separate endpoint
    }
    
    alerts = []
    for alert_id in current_data.get("alerts", []):
        alerts.append(alert_id)
        
    return {
        "current": current_formatted,
        "alerts": alerts
    }

async def fetch_timeline_1min(lat: float, lon: float) -> dict:
    url = "https://api.openweathermap.org/data/4.0/onecall/timeline/1min"
    params = {"lat": lat, "lon": lon, "appid": get_api_key()}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail={"code": "WEATHER_API_ERROR", "message": "Unable to retrieve weather data."})
        return response.json()

async def fetch_timeline_15min(lat: float, lon: float) -> dict:
    url = "https://api.openweathermap.org/data/4.0/onecall/timeline/15min"
    params = {"lat": lat, "lon": lon, "units": "metric", "appid": get_api_key()}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail={"code": "WEATHER_API_ERROR", "message": "Unable to retrieve weather data."})
        return response.json()

async def fetch_timeline_1h(lat: float, lon: float) -> dict:
    url = "https://api.openweathermap.org/data/4.0/onecall/timeline/1h"
    params = {"lat": lat, "lon": lon, "units": "metric", "appid": get_api_key()}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail={"code": "WEATHER_API_ERROR", "message": "Unable to retrieve weather data."})
        return response.json()

async def fetch_timeline_formatted_1h(lat: float, lon: float) -> list:
    """
    Fetch 3-hourly forecast from the free OWM data/2.5/forecast API and
    return as a flat list of hourly-style items compatible with the frontend.
    """
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "cnt": 40,  # 5 days × 8 slots/day
        "appid": get_api_key()
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail={"code": "WEATHER_API_ERROR", "message": f"Hourly forecast error: {response.status_code}"}
            )
        
        data = response.json()
        hourly_list = []
        for item in data.get("list", []):
            dt = datetime.fromtimestamp(item.get("dt", 0), tz=timezone.utc)
            weather_info = item.get("weather", [{}])[0]
            ow_icon = weather_info.get("icon", "01d")
            weather_id = weather_info.get("id", 800)
            clouds = item.get("clouds", {}).get("all", 0)
            
            hourly_list.append({
                "time": dt.strftime("%H:%M"),
                "timestamp": item.get("dt", 0),
                "temperature": _safe_float(item.get("main", {}).get("temp")),
                "feels_like": _safe_float(item.get("main", {}).get("feels_like")),
                "condition": map_condition_from_id(weather_id, ow_icon),
                "precipitation_probability": _safe_float(item.get("pop", 0) * 100),
                "precipitation_amount": _safe_float(item.get("rain", {}).get("3h", 0)) + _safe_float(item.get("snow", {}).get("3h", 0)),
                "rain": _safe_float(item.get("rain", {}).get("3h", 0)),
                "showers": 0.0,
                "humidity": _safe_float(item.get("main", {}).get("humidity")),
                "pressure": _safe_float(item.get("main", {}).get("pressure")),
                "wind_speed": _safe_float(item.get("wind", {}).get("speed")),
                "wind_speed_80m": _safe_float(item.get("wind", {}).get("speed")),
                "wind_direction": _safe_float(item.get("wind", {}).get("deg")),
                "wind_gust": _safe_float(item.get("wind", {}).get("gust")),
                "visibility": _safe_float(item.get("visibility", 10000) / 1000.0),
                "cloud_cover": _safe_float(clouds),
                "uv_index": 0.0,  # not available on 2.5/forecast
                "sunshine_duration_s": 0.0,
                "is_day": ow_icon.endswith("d"),
                "icon": map_icon(ow_icon)
            })
        return hourly_list

async def fetch_timeline_formatted_daily(lat: float, lon: float) -> list:
    """
    Fetch 5-day forecast from the free OWM data/2.5/forecast API.
    The API returns 3-hour slots; we aggregate them per calendar day (UTC).
    
    Aggregation rules per day:
    - temp_high  : max of all 3h temps
    - temp_low   : min of all 3h temps  
    - condition  : most frequent weather_id across slots (dominant condition)
    - pop        : max precipitation probability
    - rain/snow  : sum of all 3h accumulations
    - wind_speed : max wind speed
    - wind_gust  : max wind gust
    """
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "cnt": 40,  # 5 days × 8 slots/day
        "appid": get_api_key()
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail={"code": "WEATHER_API_ERROR", "message": f"Daily forecast error: {response.status_code}"}
            )
            
        data = response.json()
        
        # Group 3-hour slots by UTC date
        from collections import defaultdict
        days: dict = defaultdict(list)
        for item in data.get("list", []):
            dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
            date_key = dt.strftime("%Y-%m-%d")
            days[date_key].append(item)
        
        # Also grab city-level sunrise/sunset if available
        city = data.get("city", {})
        city_sunrise = city.get("sunrise", 0)
        city_sunset = city.get("sunset", 0)
        
        daily_list = []
        for date_key in sorted(days.keys()):
            slots = days[date_key]
            dt = datetime.strptime(date_key, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            
            # Aggregate temperature
            temps = [s.get("main", {}).get("temp", 0) for s in slots]
            temp_high = max(temps)
            temp_low = min(temps)
            
            # Dominant condition = most frequently occurring weather_id
            from collections import Counter
            weather_ids = []
            for s in slots:
                wi = s.get("weather", [{}])[0]
                weather_ids.append((wi.get("id", 800), wi.get("icon", "01d")))
            # Pick the most common id; daytime icon preferred if tie
            id_counter = Counter(wid for wid, _ in weather_ids)
            dominant_id = id_counter.most_common(1)[0][0]
            # Find a representative icon for the dominant id (prefer daytime)
            dominant_icon = "01d"
            for wid, wicon in weather_ids:
                if wid == dominant_id:
                    dominant_icon = wicon
                    if wicon.endswith("d"):  # prefer day icon
                        break
            
            # Precipitation
            max_pop = max(s.get("pop", 0) for s in slots)
            rain_sum = sum(_safe_float(s.get("rain", {}).get("3h", 0)) for s in slots)
            snow_sum = sum(_safe_float(s.get("snow", {}).get("3h", 0)) for s in slots)
            
            # Wind
            max_wind = max(s.get("wind", {}).get("speed", 0) for s in slots)
            max_gust = max(s.get("wind", {}).get("gust", 0) for s in slots)
            # Dominant wind direction (mode)
            wind_dirs = [s.get("wind", {}).get("deg", 0) for s in slots]
            dominant_wind_dir = Counter(wind_dirs).most_common(1)[0][0]
            
            # Humidity & pressure (averages)
            avg_humidity = sum(s.get("main", {}).get("humidity", 0) for s in slots) / len(slots)
            avg_pressure = sum(s.get("main", {}).get("pressure", 0) for s in slots) / len(slots)
            
            # Daylight hours from city info (same for all days in 2.5/forecast)
            daylight_hrs = _calc_daylight_hours(city_sunrise, city_sunset)
            
            daily_list.append({
                "date": date_key,
                "day_name": dt.strftime("%A"),
                "temperature_high": _safe_float(temp_high),
                "temperature_low": _safe_float(temp_low),
                "condition": map_condition_from_id(dominant_id, dominant_icon),
                "description": "",  # filled below
                "precipitation_probability": _safe_float(max_pop * 100),
                "precipitation_amount": _safe_float(rain_sum + snow_sum),
                "rain_sum": _safe_float(rain_sum),
                "showers_sum": 0.0,
                "snowfall_sum": _safe_float(snow_sum),
                "precipitation_hours": _safe_float(sum(1 for s in slots if s.get("pop", 0) > 0.2) * 3),
                "wind_speed": _safe_float(max_wind),
                "wind_gust_max": _safe_float(max_gust),
                "wind_direction_dominant": str(dominant_wind_dir),
                "uv_index": 0.0,  # not in 2.5/forecast
                "uv_index_clear_sky": 0.0,
                "sunshine_duration_hrs": daylight_hrs,
                "daylight_duration_hrs": daylight_hrs,
                "shortwave_radiation_sum": 0.0,
                "moon_phase": 0.0,
                "moonrise": "",
                "moonset": "",
                "sunrise": format_timestamp(city_sunrise) if city_sunrise else "",
                "sunset": format_timestamp(city_sunset) if city_sunset else "",
                "icon": map_icon(dominant_icon)
            })
            # Fill description after building condition
            daily_list[-1]["description"] = daily_list[-1]["condition"]
        
        return daily_list

async def fetch_alert_details(alert_id: str) -> dict:
    url = f"https://api.openweathermap.org/data/4.0/onecall/alert/{alert_id}"
    params = {"appid": get_api_key()}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail={"code": "WEATHER_API_ERROR", "message": "Unable to retrieve alert details."})
        data = response.json()
        return {
            "id": data.get("id"),
            "sender_name": data.get("sender_name"),
            "event": data.get("event"),
            "start": format_timestamp(data.get("start")),
            "end": format_timestamp(data.get("end")),
            "description": data.get("description")
        }
