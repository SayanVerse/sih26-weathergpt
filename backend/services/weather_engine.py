from typing import Dict, Any

# WMO Weather interpretation codes (WW)
# https://open-meteo.com/en/docs
WMO_CODES = {
    0: {"condition": "Clear sky", "icon": "clear-day"},
    1: {"condition": "Mainly clear", "icon": "clear-day"},
    2: {"condition": "Partly cloudy", "icon": "partly-cloudy-day"},
    3: {"condition": "Overcast", "icon": "cloudy"},
    45: {"condition": "Fog", "icon": "fog"},
    48: {"condition": "Depositing rime fog", "icon": "fog"},
    51: {"condition": "Light drizzle", "icon": "rain"},
    53: {"condition": "Moderate drizzle", "icon": "rain"},
    55: {"condition": "Dense drizzle", "icon": "rain"},
    56: {"condition": "Light freezing drizzle", "icon": "snow"},
    57: {"condition": "Dense freezing drizzle", "icon": "snow"},
    61: {"condition": "Slight rain", "icon": "rain"},
    63: {"condition": "Moderate rain", "icon": "rain"},
    65: {"condition": "Heavy rain", "icon": "rain"},
    66: {"condition": "Light freezing rain", "icon": "snow"},
    67: {"condition": "Heavy freezing rain", "icon": "snow"},
    71: {"condition": "Slight snow fall", "icon": "snow"},
    73: {"condition": "Moderate snow fall", "icon": "snow"},
    75: {"condition": "Heavy snow fall", "icon": "snow"},
    77: {"condition": "Snow grains", "icon": "snow"},
    80: {"condition": "Slight rain showers", "icon": "rain"},
    81: {"condition": "Moderate rain showers", "icon": "rain"},
    82: {"condition": "Violent rain showers", "icon": "rain"},
    85: {"condition": "Slight snow showers", "icon": "snow"},
    86: {"condition": "Heavy snow showers", "icon": "snow"},
    95: {"condition": "Thunderstorm", "icon": "thunderstorm"},
    96: {"condition": "Thunderstorm with slight hail", "icon": "thunderstorm"},
    99: {"condition": "Thunderstorm with heavy hail", "icon": "thunderstorm"},
}

def get_condition(wmo_code: int, is_day: bool = True) -> Dict[str, str]:
    """
    Converts a raw WMO weather code into a normalized human-readable condition.
    Adjusts the icon based on whether it is day or night.
    """
    mapping = WMO_CODES.get(wmo_code, {"condition": "Unknown", "icon": "unknown"})
    
    icon = mapping["icon"]
    # Adjust icons for night time
    if not is_day:
        if icon == "clear-day":
            icon = "clear-night"
        elif icon == "partly-cloudy-day":
            icon = "partly-cloudy-night"
            
    return {
        "condition": mapping["condition"],
        "icon": icon,
        "condition_code": str(wmo_code)
    }
