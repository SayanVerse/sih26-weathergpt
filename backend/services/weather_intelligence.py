from typing import Dict, Any, List

def generate_weather_signals(current: Dict[str, Any], daily: list, hourly: list) -> List[Dict[str, str]]:
    """
    Generates deterministic signals/alerts from the weather data.
    daily and hourly are plain lists of forecast items.
    The LLM will use these signals to ground its recommendations.
    """
    signals = []
    
    temp = current.get("temperature", 20)
    feels = current.get("feels_like", temp)
    uv = current.get("uv_index", 0)
    wind = current.get("wind_speed", 0)  # m/s from OWM
    wind_kmh = round(wind * 3.6, 1)      # convert to km/h for thresholds
    visibility = current.get("visibility", 10)
    humidity = current.get("humidity", 50)
    aqi = current.get("air_quality_index", 50)
    cond_lower = current.get("condition", "").lower()

    # Temperature / Heat
    if feels >= 35:
        signals.append({
            "type": "heat",
            "severity": "high",
            "title": "Extreme Heat Warning",
            "description": f"Feels like {feels}°C. Prolonged outdoor activity is dangerous. Heat exhaustion likely."
        })
    elif feels >= 30:
        signals.append({
            "type": "heat",
            "severity": "medium",
            "title": "High Heat",
            "description": f"Feels like {feels}°C. Stay hydrated and avoid strenuous outdoor exercise during peak sun."
        })
    elif temp < 5:
        signals.append({
            "type": "cold",
            "severity": "high",
            "title": "Freezing Conditions",
            "description": f"Temperature is {temp}°C. Wear heavy winter clothing to avoid frostbite or hypothermia."
        })
        
    # UV Index
    if uv >= 8:
        signals.append({
            "type": "uv",
            "severity": "high",
            "title": "Very High UV Index",
            "description": f"UV Index {uv}. Sun protection is absolutely essential. Burn time is very short."
        })
    elif uv >= 6:
        signals.append({
            "type": "uv",
            "severity": "medium",
            "title": "High UV Index",
            "description": f"UV Index {uv}. Wear sunscreen and sunglasses if going outside."
        })

    # Wind
    if wind_kmh >= 40:
        signals.append({
            "type": "wind",
            "severity": "high",
            "title": "High Winds",
            "description": f"Winds are strong at {wind_kmh} km/h. Outdoor activities like cycling or running may be very difficult."
        })
        
    # Rain / Precipitation - check current condition
    rain_keywords = ["rain", "shower", "drizzle", "sleet"]
    snow_keywords = ["snow", "blizzard"]
    thunder_keywords = ["thunder", "storm"]
    
    if any(k in cond_lower for k in thunder_keywords):
        signals.append({
            "type": "thunderstorm",
            "severity": "high",
            "title": "Thunderstorm Warning",
            "description": "A thunderstorm is active. Seek shelter indoors immediately. Avoid open areas, tall trees, and metal objects."
        })
    elif any(k in cond_lower for k in rain_keywords):
        signals.append({
            "type": "rain",
            "severity": "high",
            "title": "Currently Raining",
            "description": "It is currently raining. An umbrella and rain gear are necessary right now."
        })
    elif any(k in cond_lower for k in snow_keywords):
        signals.append({
            "type": "snow",
            "severity": "high",
            "title": "Currently Snowing",
            "description": "It is currently snowing. Travel may be impacted. Dress warmly."
        })
    else:
        # Check upcoming 12 hours for high rain probability — hourly is a plain list
        max_precip_prob = 0
        for h in (hourly or [])[:12]:
            p = h.get("precipitation_probability", 0)
            if p > max_precip_prob:
                max_precip_prob = p
                    
        if max_precip_prob >= 70:
            signals.append({
                "type": "rain",
                "severity": "medium",
                "title": "High Rain Probability Later",
                "description": f"There is a {max_precip_prob}% chance of rain in the next 12 hours. Carrying an umbrella is highly recommended."
            })

    # Visibility & Air Quality
    if visibility < 2:
        signals.append({
            "type": "visibility",
            "severity": "high",
            "title": "Poor Visibility",
            "description": f"Visibility is very low ({visibility} km). Driving may be dangerous."
        })
        
    if aqi > 150:
        signals.append({
            "type": "air_quality",
            "severity": "high",
            "title": "Unhealthy Air Quality",
            "description": f"AQI is {aqi}. Sensitive groups should avoid outdoor exertion."
        })

    # General Outdoor Suitability
    is_good_outdoor = (
        10 <= temp <= 28
        and not any(k in cond_lower for k in ["rain", "shower", "drizzle", "snow", "thunder", "storm", "sleet"])
        and wind_kmh < 30
        and aqi <= 100
        and feels < 30
    )
    if is_good_outdoor:
        signals.append({
            "type": "outdoor",
            "severity": "low",
            "title": "Ideal Outdoor Conditions",
            "description": "Current conditions are very favorable for outdoor activities, walking, or sports."
        })
        
    return signals
