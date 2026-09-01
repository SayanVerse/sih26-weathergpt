from typing import Dict, Any, List

def evaluate_weather_risks(current: Dict[str, Any], daily: list, hourly: list) -> List[Dict[str, Any]]:
    """
    Evaluates normalized weather data and produces deterministic risk signals.
    daily and hourly are plain lists of forecast items.
    Each risk signal contains type, severity, trigger_value, and threshold.
    """
    risks = []
    
    # Retrieve base variables
    temp = current.get("temperature")
    feels = current.get("feels_like", temp)
    wind = current.get("wind_speed")
    wind_kmh = round(wind * 3.6, 1) if wind is not None else None
    uv = current.get("uv_index")
    visibility = current.get("visibility")
    aqi = current.get("air_quality_index")
    
    # 1. Extreme Heat Risk
    if feels is not None:
        if feels >= 40:
            risks.append({
                "type": "extreme_heat",
                "severity": "HIGH",
                "trigger_value": feels,
                "threshold": 40
            })
        elif feels >= 35:
            risks.append({
                "type": "high_heat",
                "severity": "MEDIUM",
                "trigger_value": feels,
                "threshold": 35
            })

    # 2. Extreme Cold Risk
    if temp is not None:
        if temp <= -10:
            risks.append({
                "type": "extreme_cold",
                "severity": "HIGH",
                "trigger_value": temp,
                "threshold": -10
            })
        elif temp <= 0:
            risks.append({
                "type": "freezing_conditions",
                "severity": "MEDIUM",
                "trigger_value": temp,
                "threshold": 0
            })
            
    # 3. High Wind Risk (compare km/h thresholds)
    if wind_kmh is not None:
        if wind_kmh >= 60:
            risks.append({
                "type": "extreme_wind",
                "severity": "HIGH",
                "trigger_value": wind_kmh,
                "threshold": 60
            })
        elif wind_kmh >= 40:
            risks.append({
                "type": "high_wind",
                "severity": "MEDIUM",
                "trigger_value": wind_kmh,
                "threshold": 40
            })
            
    # 4. Extreme UV Risk
    if uv is not None:
        if uv >= 8:
            risks.append({
                "type": "extreme_uv",
                "severity": "HIGH",
                "trigger_value": uv,
                "threshold": 8
            })
        elif uv >= 6:
            risks.append({
                "type": "high_uv",
                "severity": "MEDIUM",
                "trigger_value": uv,
                "threshold": 6
            })
            
    # 5. Low Visibility Risk
    if visibility is not None:
        if visibility < 2:
            risks.append({
                "type": "poor_visibility",
                "severity": "HIGH",
                "trigger_value": visibility,
                "threshold": 2
            })
            
    # 6. Poor Air Quality Risk
    if aqi is not None:
        if aqi > 150:
            risks.append({
                "type": "unhealthy_air_quality",
                "severity": "HIGH",
                "trigger_value": aqi,
                "threshold": 150
            })
            
    # 7. Heavy Rain / Precipitation Risk (Next 12 Hours) — hourly is a plain list
    max_precip_prob = 0
    for h in (hourly or [])[:12]:
        p = h.get("precipitation_probability", 0)
        if p > max_precip_prob:
            max_precip_prob = p
                
    if max_precip_prob >= 80:
        risks.append({
            "type": "heavy_rain_expected",
            "severity": "HIGH",
            "trigger_value": max_precip_prob,
            "threshold": 80
        })
    elif max_precip_prob >= 50:
        risks.append({
            "type": "rain_expected",
            "severity": "MEDIUM",
            "trigger_value": max_precip_prob,
            "threshold": 50
        })

    return risks
