from pydantic import BaseModel
from typing import List, Optional

class DailyHistoricalWeather(BaseModel):
    date: str
    temperature_max: Optional[float]
    temperature_min: Optional[float]
    precipitation_sum: Optional[float]

class ClimateStatistics(BaseModel):
    avg_temp_max: float
    avg_temp_min: float
    total_precipitation: float
    max_temp_recorded: float
    min_temp_recorded: float

class TrendAnalysis(BaseModel):
    temp_trend: str
    precipitation_anomaly: str

class HistoricalClimateResponse(BaseModel):
    location_name: str
    lat: float
    lon: float
    start_date: str
    end_date: str
    daily_data: List[DailyHistoricalWeather]
    statistics: ClimateStatistics
    trends: TrendAnalysis
    insights: List[str]
