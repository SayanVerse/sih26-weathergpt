# WeatherGPT — Open-Meteo Phase 1 Integration

## Python Implementation

### Install Dependencies

pip install openmeteo-requests
pip install requests-cache retry-requests numpy pandas


import openmeteo_requests
import pandas as pd
import requests_cache

from retry_requests import retry

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession(
    ".cache",
    expire_after=3600
)

retry_session = retry(
    cache_session,
    retries=5,
    backoff_factor=0.2
)

openmeteo = openmeteo_requests.Client(
    session=retry_session
)

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important
# to assign them correctly below

url = "https://api.open-meteo.com/v1/forecast"

params = {
    "latitude": 52.52,
    "longitude": 13.41,

    "hourly": [
        "temperature_2m",
        "cloud_cover",
        "rain",
        "precipitation",
        "precipitation_probability"
    ],

    "current": [
        "temperature_2m",
        "precipitation",
        "apparent_temperature",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "relative_humidity_2m",
        "is_day",
        "showers",
        "snowfall",
        "rain"
    ],
}

responses = openmeteo.weather_api(url, params=params)

# Process first location.
# Add a for-loop for multiple locations or weather models.

response = responses[0]

print(
    f"Coordinates: {response.Latitude()}°N "
    f"{response.Longitude()}°E"
)

print(f"Elevation: {response.Elevation()} m asl")

print(
    f"Timezone difference to GMT+0: "
    f"{response.UtcOffsetSeconds()}s"
)

# Process current data.
# The order of variables needs to be the same as requested.

current = response.Current()

current_temperature_2m = current.Variables(0).Value()
current_precipitation = current.Variables(1).Value()
current_apparent_temperature = current.Variables(2).Value()
current_wind_speed_10m = current.Variables(3).Value()
current_wind_direction_10m = current.Variables(4).Value()
current_wind_gusts_10m = current.Variables(5).Value()
current_relative_humidity_2m = current.Variables(6).Value()
current_is_day = current.Variables(7).Value()
current_showers = current.Variables(8).Value()
current_snowfall = current.Variables(9).Value()
current_rain = current.Variables(10).Value()

print(f"\nCurrent time: {current.Time()}")
print(f"Current temperature_2m: {current_temperature_2m}")
print(f"Current precipitation: {current_precipitation}")
print(
    f"Current apparent_temperature: "
    f"{current_apparent_temperature}"
)
print(
    f"Current wind_speed_10m: "
    f"{current_wind_speed_10m}"
)
print(
    f"Current wind_direction_10m: "
    f"{current_wind_direction_10m}"
)
print(
    f"Current wind_gusts_10m: "
    f"{current_wind_gusts_10m}"
)
print(
    f"Current relative_humidity_2m: "
    f"{current_relative_humidity_2m}"
)
print(f"Current is_day: {current_is_day}")
print(f"Current showers: {current_showers}")
print(f"Current snowfall: {current_snowfall}")
print(f"Current rain: {current_rain}")

# Process hourly data.
# The order of variables needs to be the same as requested.

hourly = response.Hourly()

hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
hourly_cloud_cover = hourly.Variables(1).ValuesAsNumpy()
hourly_rain = hourly.Variables(2).ValuesAsNumpy()
hourly_precipitation = hourly.Variables(3).ValuesAsNumpy()
hourly_precipitation_probability = (
    hourly.Variables(4).ValuesAsNumpy()
)

hourly_data = {
    "date": pd.date_range(
        start=pd.to_datetime(
            hourly.Time(),
            unit="s",
            utc=True
        ),
        end=pd.to_datetime(
            hourly.TimeEnd(),
            unit="s",
            utc=True
        ),
        freq=pd.Timedelta(
            seconds=hourly.Interval()
        ),
        inclusive="left"
    )
}

hourly_data["temperature_2m"] = hourly_temperature_2m
hourly_data["cloud_cover"] = hourly_cloud_cover
hourly_data["rain"] = hourly_rain
hourly_data["precipitation"] = hourly_precipitation
hourly_data["precipitation_probability"] = (
    hourly_precipitation_probability
)

hourly_dataframe = pd.DataFrame(
    data=hourly_data
)

print("\nHourly data\n", hourly_dataframe)