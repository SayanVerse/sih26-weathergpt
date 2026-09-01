from fastapi.testclient import TestClient
import pytest
from unittest.mock import patch
from main import app

client = TestClient(app)

def test_health_endpoints():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@patch("main.search_locations")
def test_search_location(mock_search):
    mock_search.return_value = [
        {
            "id": 123,
            "name": "London",
            "admin1": "England",
            "country": "United Kingdom",
            "latitude": 51.5085,
            "longitude": -0.1257,
            "timezone": "Europe/London",
            "elevation": 25.0
        }
    ]
    
    response = client.get("/api/locations/search?q=London")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "London"
    assert data[0]["country"] == "United Kingdom"
    assert data[0]["region"] == "England"
    
    # Test short query returns empty list
    response = client.get("/api/locations/search?q=L")
    assert response.status_code == 200
    assert response.json() == []

@patch("main.get_cached_weather")
@patch("main.set_cached_weather")
@patch("main.fetch_weather_formatted")
def test_get_weather_current(mock_fetch, mock_set_cache, mock_get_cache):
    mock_get_cache.return_value = None
    mock_fetch.return_value = {
        "location": {
            "name": "London",
            "country": "United Kingdom",
            "latitude": 51.5,
            "longitude": -0.1,
            "timezone": "Europe/London"
        },
        "current": {
            "location": {
                "name": "London",
                "country": "United Kingdom",
                "latitude": 51.5,
                "longitude": -0.1,
            },
            "temperature": 15.5,
            "feels_like": 14.0,
            "condition": "Cloudy",
            "description": "Cloudy",
            "humidity": 70,
            "pressure": 1012,
            "wind_speed": 10.5,
            "wind_direction": "NW",
            "visibility": 10.0,
            "uv_index": 3.0,
            "sunrise": "06:00 AM",
            "sunset": "06:00 PM",
            "icon": "cloud",
            "timestamp": "2023-10-01T12:00:00Z",
            "is_day": True
        }
    }
    
    response = client.get("/api/weather/current?lat=51.5&lon=-0.1&name=London")
    assert response.status_code == 200
    data = response.json()
    assert data["temperature"] == 15.5
    assert data["condition"] == "Cloudy"

@patch("main.get_cached_weather")
@patch("main.fetch_weather_formatted")
def test_get_weather_forecast(mock_fetch, mock_get_cache):
    mock_get_cache.return_value = None
    mock_fetch.return_value = {
        "daily": {
            "location": {
                "name": "London",
                "country": "UK",
                "latitude": 51.5,
                "longitude": -0.1,
            },
            "forecast": [
                {
                    "date": "2023-10-01",
                    "day_name": "Sunday",
                    "temperature_high": 20.0,
                    "temperature_low": 10.0,
                    "condition": "Sunny",
                    "precipitation_probability": 10.0,
                    "humidity": 60,
                    "wind_speed": 15.0,
                    "icon": "sun"
                }
            ]
        }
    }
    
    response = client.get("/api/weather/forecast?lat=51.5&lon=-0.1")
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data
    assert len(data["forecast"]) == 1
    assert data["forecast"][0]["temperature_high"] == 20.0

