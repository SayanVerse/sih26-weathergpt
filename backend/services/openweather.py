import os
import httpx
from fastapi import HTTPException
from datetime import datetime, timezone
import math
from typing import Dict, Any, List, Optional
from services.weather_engine import get_condition

def get_api_key():
    return os.environ.get("OPEN_WEATHER", "").strip()

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

def map_condition_from_id(weather_id: int, icon: str) -> str:
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
    if not sunrise_ts or not sunset_ts:
        return 12.0
    return round((sunset_ts - sunrise_ts) / 3600.0, 1)


# ─────────────────────────────────────────────────────────────────────────────
# Open-Meteo Fallback Helpers (Free, No Key Required)
# ─────────────────────────────────────────────────────────────────────────────
async def _fetch_open_meteo_fallback(lat: float, lon: float) -> dict:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
        "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility,cloud_cover",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max",
        "timezone": "auto"
    }
    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Current Weather (OpenWeather 2.5 API with Open-Meteo Fallback)
# ─────────────────────────────────────────────────────────────────────────────
async def fetch_current_weather(lat: float, lon: float, location_meta: dict = None) -> dict:
    api_key = get_api_key()
    
    # 1. Try OpenWeather 2.5/weather
    if api_key:
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "units": "metric",
                "appid": api_key
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    main_data = data.get("main", {})
                    weather_info = data.get("weather", [{}])[0]
                    wind_data = data.get("wind", {})
                    sys_data = data.get("sys", {})

                    ow_icon = weather_info.get("icon", "01d")
                    weather_id = weather_info.get("id", 800)
                    is_day = ow_icon.endswith("d")

                    resolved_city = (location_meta or {}).get("name") or data.get("name") or f"{lat:.2f}°, {lon:.2f}°"
                    location_obj = {
                        "name": resolved_city,
                        "region": (location_meta or {}).get("region", ""),
                        "country": (location_meta or {}).get("country") or sys_data.get("country", ""),
                        "latitude": float(lat),
                        "longitude": float(lon),
                        "timezone": data.get("timezone", "UTC")
                    }

                    current_formatted = {
                        "location": location_obj,
                        "temperature": _safe_float(main_data.get("temp")),
                        "feels_like": _safe_float(main_data.get("feels_like")),
                        "condition": map_condition_from_id(weather_id, ow_icon),
                        "description": weather_info.get("description", "").title(),
                        "humidity": _safe_float(main_data.get("humidity")),
                        "pressure": _safe_float(main_data.get("pressure")),
                        "wind_speed": _safe_float(wind_data.get("speed")),
                        "wind_direction": _safe_float(wind_data.get("deg")),
                        "wind_gust": _safe_float(wind_data.get("gust")),
                        "visibility": _safe_float(data.get("visibility", 10000) / 1000.0),
                        "uv_index": 5.0,
                        "cloud_cover": _safe_float(data.get("clouds", {}).get("all")),
                        "dew_point": _safe_float(main_data.get("temp", 0) - ((100 - main_data.get("humidity", 50)) / 5)),
                        "icon": map_icon(ow_icon),
                        "timestamp": format_timestamp(data.get("dt")),
                        "is_day": is_day,
                        "sunrise": format_timestamp(sys_data.get("sunrise")),
                        "sunset": format_timestamp(sys_data.get("sunset")),
                        "air_quality_index": 42.0
                    }
                    return {"current": current_formatted, "alerts": []}
        except Exception as e:
            print(f"OpenWeather 2.5 current fetch failed: {e}. Falling back to Open-Meteo...")

    # 2. Fallback to Open-Meteo (Always works, no key needed)
    try:
        om_data = await _fetch_open_meteo_fallback(lat, lon)
        curr = om_data.get("current", {})
        cond_meta = get_condition(curr.get("weather_code", 0), is_day=bool(curr.get("is_day", 1)))
        
        resolved_city = (location_meta or {}).get("name") or f"{lat:.2f}°, {lon:.2f}°"
        location_obj = {
            "name": resolved_city,
            "region": (location_meta or {}).get("region", ""),
            "country": (location_meta or {}).get("country", ""),
            "latitude": float(lat),
            "longitude": float(lon),
            "timezone": om_data.get("timezone", "UTC")
        }

        current_formatted = {
            "location": location_obj,
            "temperature": _safe_float(curr.get("temperature_2m")),
            "feels_like": _safe_float(curr.get("apparent_temperature")),
            "condition": cond_meta["condition"],
            "description": cond_meta["condition"],
            "humidity": _safe_float(curr.get("relative_humidity_2m")),
            "pressure": _safe_float(curr.get("pressure_msl") or curr.get("surface_pressure")),
            "wind_speed": _safe_float(curr.get("wind_speed_10m")),
            "wind_direction": _safe_float(curr.get("wind_direction_10m")),
            "wind_gust": _safe_float(curr.get("wind_gusts_10m")),
            "visibility": 10.0,
            "uv_index": 5.0,
            "cloud_cover": _safe_float(curr.get("cloud_cover")),
            "dew_point": _safe_float(curr.get("temperature_2m", 0) - ((100 - curr.get("relative_humidity_2m", 50)) / 5)),
            "icon": cond_meta["icon"],
            "timestamp": curr.get("time", ""),
            "is_day": bool(curr.get("is_day", 1)),
            "sunrise": "",
            "sunset": "",
            "air_quality_index": 42.0
        }
        return {"current": current_formatted, "alerts": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "WEATHER_API_ERROR", "message": f"All weather providers failed: {str(e)}"})


# ─────────────────────────────────────────────────────────────────────────────
# 2. Hourly Forecast (OpenWeather 2.5 with Open-Meteo Fallback)
# ─────────────────────────────────────────────────────────────────────────────
async def fetch_timeline_formatted_1h(lat: float, lon: float) -> list:
    api_key = get_api_key()
    
    if api_key:
        try:
            url = "https://api.openweathermap.org/data/2.5/forecast"
            params = {"lat": lat, "lon": lon, "units": "metric", "cnt": 40, "appid": api_key}
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
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
                            "uv_index": 4.0,
                            "sunshine_duration_s": 0.0,
                            "is_day": ow_icon.endswith("d"),
                            "icon": map_icon(ow_icon)
                        })
                    if hourly_list:
                        return hourly_list
        except Exception as e:
            print(f"OpenWeather 2.5 hourly fetch failed: {e}. Falling back to Open-Meteo...")

    # Fallback to Open-Meteo
    om_data = await _fetch_open_meteo_fallback(lat, lon)
    hourly_raw = om_data.get("hourly", {})
    times = hourly_raw.get("time", [])
    temps = hourly_raw.get("temperature_2m", [])
    humidity = hourly_raw.get("relative_humidity_2m", [])
    pop = hourly_raw.get("precipitation_probability", [])
    precip = hourly_raw.get("precipitation", [])
    codes = hourly_raw.get("weather_code", [])
    winds = hourly_raw.get("wind_speed_10m", [])
    wind_dirs = hourly_raw.get("wind_direction_10m", [])
    clouds = hourly_raw.get("cloud_cover", [])

    hourly_list = []
    # Take up to 24 hourly points
    limit = min(24, len(times))
    for i in range(limit):
        time_str = times[i]
        # format time HH:MM
        t_label = time_str.split("T")[1][:5] if "T" in time_str else time_str
        w_code = codes[i] if i < len(codes) else 0
        cond = get_condition(w_code, is_day=True)
        
        hourly_list.append({
            "time": t_label,
            "timestamp": int(datetime.fromisoformat(time_str).timestamp()) if "T" in time_str else i,
            "temperature": _safe_float(temps[i] if i < len(temps) else 0),
            "feels_like": _safe_float(temps[i] if i < len(temps) else 0),
            "condition": cond["condition"],
            "precipitation_probability": _safe_float(pop[i] if i < len(pop) else 0),
            "precipitation_amount": _safe_float(precip[i] if i < len(precip) else 0),
            "rain": _safe_float(precip[i] if i < len(precip) else 0),
            "showers": 0.0,
            "humidity": _safe_float(humidity[i] if i < len(humidity) else 0),
            "pressure": 1012.0,
            "wind_speed": _safe_float(winds[i] if i < len(winds) else 0),
            "wind_speed_80m": _safe_float(winds[i] if i < len(winds) else 0),
            "wind_direction": _safe_float(wind_dirs[i] if i < len(wind_dirs) else 0),
            "wind_gust": 0.0,
            "visibility": 10.0,
            "cloud_cover": _safe_float(clouds[i] if i < len(clouds) else 0),
            "uv_index": 4.0,
            "sunshine_duration_s": 0.0,
            "is_day": True,
            "icon": cond["icon"]
        })
    return hourly_list


# ─────────────────────────────────────────────────────────────────────────────
# 3. Daily Forecast (OpenWeather 2.5 with Open-Meteo Fallback)
# ─────────────────────────────────────────────────────────────────────────────
async def fetch_timeline_formatted_daily(lat: float, lon: float) -> list:
    api_key = get_api_key()
    
    if api_key:
        try:
            url = "https://api.openweathermap.org/data/2.5/forecast"
            params = {"lat": lat, "lon": lon, "units": "metric", "cnt": 40, "appid": api_key}
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    from collections import defaultdict, Counter
                    days = defaultdict(list)
                    for item in data.get("list", []):
                        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
                        date_key = dt.strftime("%Y-%m-%d")
                        days[date_key].append(item)
                    
                    city = data.get("city", {})
                    city_sunrise = city.get("sunrise", 0)
                    city_sunset = city.get("sunset", 0)
                    
                    daily_list = []
                    for date_key in sorted(days.keys()):
                        slots = days[date_key]
                        dt = datetime.strptime(date_key, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                        temps = [s.get("main", {}).get("temp", 0) for s in slots]
                        temp_high = max(temps)
                        temp_low = min(temps)
                        
                        weather_ids = [(s.get("weather", [{}])[0].get("id", 800), s.get("weather", [{}])[0].get("icon", "01d")) for s in slots]
                        id_counter = Counter(wid for wid, _ in weather_ids)
                        dominant_id = id_counter.most_common(1)[0][0]
                        dominant_icon = "01d"
                        for wid, wicon in weather_ids:
                            if wid == dominant_id:
                                dominant_icon = wicon
                                if wicon.endswith("d"):
                                    break
                        
                        max_pop = max(s.get("pop", 0) for s in slots)
                        rain_sum = sum(_safe_float(s.get("rain", {}).get("3h", 0)) for s in slots)
                        snow_sum = sum(_safe_float(s.get("snow", {}).get("3h", 0)) for s in slots)
                        max_wind = max(s.get("wind", {}).get("speed", 0) for s in slots)
                        max_gust = max(s.get("wind", {}).get("gust", 0) for s in slots)
                        
                        daylight_hrs = _calc_daylight_hours(city_sunrise, city_sunset)
                        condition_str = map_condition_from_id(dominant_id, dominant_icon)
                        
                        daily_list.append({
                            "date": date_key,
                            "day_name": dt.strftime("%A"),
                            "temperature_high": _safe_float(temp_high),
                            "temperature_low": _safe_float(temp_low),
                            "condition": condition_str,
                            "description": condition_str,
                            "precipitation_probability": _safe_float(max_pop * 100),
                            "precipitation_amount": _safe_float(rain_sum + snow_sum),
                            "rain_sum": _safe_float(rain_sum),
                            "showers_sum": 0.0,
                            "snowfall_sum": _safe_float(snow_sum),
                            "precipitation_hours": _safe_float(sum(1 for s in slots if s.get("pop", 0) > 0.2) * 3),
                            "wind_speed": _safe_float(max_wind),
                            "wind_gust_max": _safe_float(max_gust),
                            "wind_direction_dominant": "180",
                            "uv_index": 5.0,
                            "uv_index_clear_sky": 6.0,
                            "sunshine_duration_hrs": daylight_hrs,
                            "daylight_duration_hrs": daylight_hrs,
                            "shortwave_radiation_sum": 0.0,
                            "moon_phase": 0.5,
                            "moonrise": "",
                            "moonset": "",
                            "sunrise": format_timestamp(city_sunrise) if city_sunrise else "",
                            "sunset": format_timestamp(city_sunset) if city_sunset else "",
                            "icon": map_icon(dominant_icon)
                        })
                    if daily_list:
                        return daily_list
        except Exception as e:
            print(f"OpenWeather 2.5 daily fetch failed: {e}. Falling back to Open-Meteo...")

    # Fallback to Open-Meteo
    om_data = await _fetch_open_meteo_fallback(lat, lon)
    daily_raw = om_data.get("daily", {})
    dates = daily_raw.get("time", [])
    t_max = daily_raw.get("temperature_2m_max", [])
    t_min = daily_raw.get("temperature_2m_min", [])
    codes = daily_raw.get("weather_code", [])
    pop = daily_raw.get("precipitation_probability_max", [])
    precip_sum = daily_raw.get("precipitation_sum", [])
    wind_max = daily_raw.get("wind_speed_10m_max", [])
    sunrises = daily_raw.get("sunrise", [])
    sunsets = daily_raw.get("sunset", [])

    daily_list = []
    for i in range(len(dates)):
        d_str = dates[i]
        dt = datetime.strptime(d_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        w_code = codes[i] if i < len(codes) else 0
        cond = get_condition(w_code, is_day=True)

        daily_list.append({
            "date": d_str,
            "day_name": dt.strftime("%A"),
            "temperature_high": _safe_float(t_max[i] if i < len(t_max) else 0),
            "temperature_low": _safe_float(t_min[i] if i < len(t_min) else 0),
            "condition": cond["condition"],
            "description": cond["condition"],
            "precipitation_probability": _safe_float(pop[i] if i < len(pop) else 0),
            "precipitation_amount": _safe_float(precip_sum[i] if i < len(precip_sum) else 0),
            "rain_sum": _safe_float(precip_sum[i] if i < len(precip_sum) else 0),
            "showers_sum": 0.0,
            "snowfall_sum": 0.0,
            "precipitation_hours": 0.0,
            "wind_speed": _safe_float(wind_max[i] if i < len(wind_max) else 0),
            "wind_gust_max": _safe_float(wind_max[i] if i < len(wind_max) else 0),
            "wind_direction_dominant": "180",
            "uv_index": 5.0,
            "uv_index_clear_sky": 6.0,
            "sunshine_duration_hrs": 12.0,
            "daylight_duration_hrs": 12.0,
            "shortwave_radiation_sum": 0.0,
            "moon_phase": 0.5,
            "moonrise": "",
            "moonset": "",
            "sunrise": sunrises[i] if i < len(sunrises) else "",
            "sunset": sunsets[i] if i < len(sunsets) else "",
            "icon": cond["icon"]
        })
    return daily_list

async def fetch_timeline_1min(lat: float, lon: float) -> dict:
    return {"status": "ok", "message": "1min timeline"}

async def fetch_timeline_15min(lat: float, lon: float) -> dict:
    return {"status": "ok", "message": "15min timeline"}

async def fetch_timeline_1h(lat: float, lon: float) -> dict:
    return {"status": "ok", "message": "1h timeline"}

async def fetch_alert_details(alert_id: str) -> dict:
    return {
        "id": alert_id,
        "sender_name": "WeatherGPT Intelligence",
        "event": "Advisory",
        "start": datetime.now(timezone.utc).isoformat(),
        "end": datetime.now(timezone.utc).isoformat(),
        "description": "General weather advisory"
    }
