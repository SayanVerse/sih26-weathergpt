from pydantic import BaseModel
from typing import List, Optional, Union
from .location import LocationInfo


class CurrentWeatherResponse(BaseModel):
    location: LocationInfo
    temperature: float
    feels_like: float
    condition: str
    description: str
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: Union[float, str]
    wind_gust: Optional[float] = None
    visibility: float
    uv_index: float
    air_quality_index: float
    cloud_cover: Optional[float] = None
    dew_point: Optional[float] = None
    sunrise: str
    sunset: str
    icon: str
    timestamp: str
    is_day: bool


class HourlyForecastItem(BaseModel):
    time: str
    timestamp: int
    temperature: float
    feels_like: float
    condition: str
    precipitation_probability: float
    precipitation_amount: Optional[float] = None
    rain: Optional[float] = None
    showers: Optional[float] = None
    humidity: float
    pressure: Optional[float] = None
    wind_speed: float
    wind_speed_80m: Optional[float] = None
    wind_direction: Optional[Union[float, str]] = None
    wind_gust: Optional[float] = None
    visibility: Optional[float] = None
    cloud_cover: Optional[float] = None
    uv_index: Optional[float] = None
    sunshine_duration_s: Optional[float] = None
    is_day: Optional[bool] = None
    icon: str


class HourlyForecastResponse(BaseModel):
    location: LocationInfo
    hourly: List[HourlyForecastItem]


class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    temperature_high: float
    temperature_low: float
    condition: str
    description: Optional[str] = None
    precipitation_probability: float
    precipitation_amount: Optional[float] = None
    rain_sum: Optional[float] = None
    showers_sum: Optional[float] = None
    snowfall_sum: Optional[float] = None
    precipitation_hours: Optional[float] = None
    wind_speed: float
    wind_gust_max: Optional[float] = None
    wind_direction_dominant: Optional[str] = None
    uv_index: Optional[float] = None
    uv_index_clear_sky: Optional[float] = None
    sunshine_duration_hrs: Optional[float] = None
    daylight_duration_hrs: Optional[float] = None
    shortwave_radiation_sum: Optional[float] = None
    moon_phase: Optional[float] = None
    moonrise: Optional[str] = None
    moonset: Optional[str] = None
    sunrise: Optional[str] = None
    sunset: Optional[str] = None
    icon: str


class DailyForecastResponse(BaseModel):
    location: LocationInfo
    forecast: List[DailyForecastItem]


class WeatherAlertItem(BaseModel):
    id: str
    severity: str
    title: str
    headline: str
    description: str
    instruction: Optional[str] = None
    effective: str
    expires: str
    source: str
    urgency: Optional[str] = None
    areas: List[str]


class WeatherAlertsResponse(BaseModel):
    location: LocationInfo
    alerts: List[WeatherAlertItem]


class AIInsightCategory(BaseModel):
    category: str
    title: str
    description: str
    importance: str
    iconName: Optional[str] = None


class AIInsightData(BaseModel):
    summary: str
    insights: List[AIInsightCategory]
    generated_at: str


class AIChatResponse(BaseModel):
    response: str
    insights: Optional[List[str]] = None
    actionable_advice: Optional[dict] = None
    sources: Optional[List[str]] = None
