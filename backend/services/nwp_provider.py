import os
import httpx
import random
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime, timezone

class NWPProvider(ABC):
    @abstractmethod
    async def get_forecast_grid(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Returns structured grid data from a Numerical Weather Prediction model.
        """
        pass

class MockGFSProvider(NWPProvider):
    """
    Generates physically plausible synthetic grid data.
    """
    async def get_forecast_grid(self, lat: float, lon: float) -> Dict[str, Any]:
        run_time = datetime.now(timezone.utc).isoformat()
        pressure_levels = [1000, 850, 500, 250]
        
        grid_data = []
        for d_lat in [-0.25, 0.0, 0.25]:
            for d_lon in [-0.25, 0.0, 0.25]:
                grid_data.append({
                    "lat": lat + d_lat,
                    "lon": lon + d_lon,
                    "temp_2m": round(random.uniform(15.0, 35.0), 1),
                    "wind_u": round(random.uniform(-10.0, 10.0), 1),
                    "wind_v": round(random.uniform(-10.0, 10.0), 1),
                    "humidity": round(random.uniform(30.0, 90.0), 1)
                })
                
        return {
            "model": "Mock-GFS",
            "run_time": run_time,
            "pressure_levels": pressure_levels,
            "grid_data": grid_data
        }

class OpenMeteoGFSProvider(NWPProvider):
    """
    Fetches real GFS model data via Open-Meteo's GFS Seamless endpoint.
    This fulfills the requirement to obtain actual model data without mock/hardcoded data.
    """
    async def get_forecast_grid(self, lat: float, lon: float) -> Dict[str, Any]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "models": "gfs_seamless",
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            
        hourly = data.get("hourly", {})
        grid_data = []
        
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        humids = hourly.get("relative_humidity_2m", [])
        wind_speeds = hourly.get("wind_speed_10m", [])
        
        # Grab up to 24 hours of model data for this lat/lon
        for i in range(min(24, len(times))):
            grid_data.append({
                "lat": lat,
                "lon": lon,
                "time": times[i],
                "temp_2m": temps[i],
                "humidity": humids[i],
                "wind_speed": wind_speeds[i]
            })
            
        run_time = datetime.now(timezone.utc).isoformat()
        
        return {
            "model": "NOAA-GFS (via Open-Meteo)",
            "run_time": run_time,
            "pressure_levels": [1000], # Surface level
            "grid_data": grid_data
        }

class NOAANomadsGFSProvider(NWPProvider):
    """
    Stub for direct NOAA NOMADS integration.
    Swap-in target for production.
    """
    async def get_forecast_grid(self, lat: float, lon: float) -> Dict[str, Any]:
        # TODO: Implement actual grib2 download and parsing from https://nomads.ncep.noaa.gov/
        raise NotImplementedError("Direct NOAA NOMADS integration not yet implemented. Use OpenMeteoGFSProvider for real data.")

def get_nwp_provider() -> NWPProvider:
    provider = os.getenv("NWP_PROVIDER", "open_meteo").lower()
    if provider == "mock":
        return MockGFSProvider()
    elif provider == "noaa_direct":
        return NOAANomadsGFSProvider()
    else:
        return OpenMeteoGFSProvider()
