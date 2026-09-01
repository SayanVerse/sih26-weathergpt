from typing import Dict, Any

def build_weather_context(current: Dict[str, Any], daily: list, hourly: list, signals: list) -> str:
    """
    Constructs a concise, structured markdown string for the LLM based purely on actual weather data.
    """
    
    # Extract basic info
    loc = current.get("location", {})
    name = loc.get("name", "Unknown Location")
    region = loc.get("region", "")
    country = loc.get("country", "")
    full_name = f"{name}, {region}, {country}".strip(", ")
    
    context_lines = [
        f"### REAL-TIME WEATHER CONTEXT FOR: {full_name}",
        f"Latitude: {loc.get('latitude')}, Longitude: {loc.get('longitude')}",
        "---",
        "#### CURRENT CONDITIONS",
        f"- Temperature: {current.get('temperature')}°C",
        f"- Feels Like: {current.get('feels_like')}°C",
        f"- Condition: {current.get('condition')}",
        f"- Humidity: {current.get('humidity')}%",
        f"- Wind: {current.get('wind_speed')} km/h from {current.get('wind_direction')}",
        f"- UV Index: {current.get('uv_index')}",
        f"- Visibility: {current.get('visibility')} km",
        f"- Air Quality Index: {current.get('air_quality_index', 'N/A')}",
        f"- Sunrise: {current.get('sunrise')} | Sunset: {current.get('sunset')}"
    ]
    
    # Add deterministic intelligence signals
    if signals:
        context_lines.append("\n#### DETERMINISTIC WEATHER ALERTS / INSIGHTS")
        for sig in signals:
            context_lines.append(f"- [{sig['severity'].upper()}] {sig['title']}: {sig['description']}")
            
    # Add short hourly forecast (next 12 hours) — hourly is a plain list
    if hourly:
        context_lines.append("\n#### HOURLY FORECAST (Next 12 Hours)")
        for h in hourly[:12]:
            t = h.get("time")
            temp = h.get("temperature")
            cond = h.get("condition")
            precip = h.get("precipitation_probability", 0)
            context_lines.append(f"- {t}: {temp}°C, {cond}, Rain Prob: {precip}%")
            
    # Add daily forecast (next 3 days) — daily is a plain list
    if daily:
        context_lines.append("\n#### DAILY FORECAST (Next 3 Days)")
        
        # Calculate max precip for the next 12 hours from hourly list
        today_precip_from_hourly = 0
        for h in (hourly or [])[:12]:
            p = h.get("precipitation_probability", 0)
            if p > today_precip_from_hourly:
                today_precip_from_hourly = p

        for i, d in enumerate(daily[:3]):
            date = d.get("date")
            high = d.get("temperature_high")
            low = d.get("temperature_low")
            cond = d.get("condition")
            
            # Use the upcoming 12-hour max for 'today' (index 0) to avoid past/overnight rain confusion
            if i == 0:
                precip = today_precip_from_hourly
            else:
                precip = d.get("precipitation_probability", 0)
                
            context_lines.append(f"- {date}: {high}°C / {low}°C, {cond}, Rain Prob: {precip}%")

    context_lines.append("\n### END WEATHER CONTEXT")
    
    return "\n".join(context_lines)
