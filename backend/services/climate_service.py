import httpx
from datetime import datetime, timedelta
import statistics
from schemas.climate import (
    DailyHistoricalWeather,
    ClimateStatistics,
    TrendAnalysis,
    HistoricalClimateResponse
)

async def get_historical_climate(lat: float, lon: float, location_name: str = "Unknown", days: int = 30) -> HistoricalClimateResponse:
    # Use Open-Meteo Historical/Archive API
    # Usually data is available up to 2-3 days ago. We'll use UTC now - 2 days to be safe.
    end_date = (datetime.utcnow() - timedelta(days=2)).date()
    start_date = end_date - timedelta(days=days-1)

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "timezone": "auto"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    t_max = daily.get("temperature_2m_max", [])
    t_min = daily.get("temperature_2m_min", [])
    precip = daily.get("precipitation_sum", [])

    daily_data = []
    valid_t_max = []
    valid_t_min = []
    valid_precip = []

    for i in range(len(dates)):
        day_t_max = t_max[i]
        day_t_min = t_min[i]
        day_precip = precip[i]
        
        daily_data.append(
            DailyHistoricalWeather(
                date=dates[i],
                temperature_max=day_t_max,
                temperature_min=day_t_min,
                precipitation_sum=day_precip
            )
        )
        if day_t_max is not None: valid_t_max.append(day_t_max)
        if day_t_min is not None: valid_t_min.append(day_t_min)
        if day_precip is not None: valid_precip.append(day_precip)

    if not valid_t_max:
        raise ValueError("No valid historical data found for the given location and date range.")

    # Calculate statistics
    avg_t_max = statistics.mean(valid_t_max) if valid_t_max else 0.0
    avg_t_min = statistics.mean(valid_t_min) if valid_t_min else 0.0
    total_precip = sum(valid_precip) if valid_precip else 0.0
    abs_max = max(valid_t_max) if valid_t_max else 0.0
    abs_min = min(valid_t_min) if valid_t_min else 0.0

    stats = ClimateStatistics(
        avg_temp_max=round(avg_t_max, 2),
        avg_temp_min=round(avg_t_min, 2),
        total_precipitation=round(total_precip, 2),
        max_temp_recorded=round(abs_max, 2),
        min_temp_recorded=round(abs_min, 2)
    )

    # Trend Analysis (First half vs Second half)
    half = len(valid_t_max) // 2
    if half > 0:
        first_half_avg = statistics.mean(valid_t_max[:half])
        second_half_avg = statistics.mean(valid_t_max[half:])
        temp_diff = second_half_avg - first_half_avg
        if temp_diff > 1.5:
            temp_trend = "Warming"
        elif temp_diff < -1.5:
            temp_trend = "Cooling"
        else:
            temp_trend = "Stable"
    else:
        temp_trend = "Unknown"

    # Simplistic precipitation anomaly
    # If total precipitation > 50mm, it's quite wet.
    if total_precip > 50:
        precip_trend = "Above Average"
    elif total_precip < 10:
        precip_trend = "Below Average"
    else:
        precip_trend = "Normal"

    trends = TrendAnalysis(
        temp_trend=temp_trend,
        precipitation_anomaly=precip_trend
    )

    insights = []
    insights.append(f"Over the last {days} days, the maximum temperature averaged {round(avg_t_max, 1)}°C.")
    if temp_trend == "Warming":
        insights.append("There has been a noticeable warming trend in the latter half of the period.")
    elif temp_trend == "Cooling":
        insights.append("Temperatures have generally cooled over the past couple of weeks.")
    else:
        insights.append("Temperatures have remained relatively stable.")
    
    if precip_trend == "Above Average":
        insights.append("The region experienced significant rainfall during this period.")
    elif precip_trend == "Below Average":
        insights.append("The region was relatively dry with below-average precipitation.")
    else:
        insights.append("Precipitation levels were normal for the period.")

    return HistoricalClimateResponse(
        location_name=location_name,
        lat=lat,
        lon=lon,
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat(),
        daily_data=daily_data,
        statistics=stats,
        trends=trends,
        insights=insights
    )
