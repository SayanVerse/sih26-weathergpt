import httpx
from typing import List, Dict, Any, Optional

GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"

async def search_locations(query: str, count: int = 10) -> List[Dict[str, Any]]:
    """
    Search for locations matching a query using the Open-Meteo Geocoding API.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GEOCODING_API_URL,
            params={
                "name": query,
                "count": count,
                "language": "en",
                "format": "json"
            }
        )
        response.raise_for_status()
        data = response.json()
        
        # Open-Meteo returns results under 'results'
        results = data.get("results", [])
        
        normalized_results = []
        for res in results:
            normalized_results.append({
                "id": res.get("id"),
                "name": res.get("name"),
                "country": res.get("country"),
                "admin1": res.get("admin1"), # state/region
                "latitude": res.get("latitude"),
                "longitude": res.get("longitude"),
                "timezone": res.get("timezone"),
                "elevation": res.get("elevation", 0.0),
            })
            
        return normalized_results

async def reverse_geocode(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Reverse geocode coordinates into human-readable city, state/region, and country.
    Uses multi-tiered provider strategy: BigDataCloud -> Nominatim -> Coordinates fallback.
    """
    # 1. Primary: BigDataCloud Client API (Free, fast, no key required)
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            bdc_url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={latitude}&longitude={longitude}&localityLanguage=en"
            resp = await client.get(bdc_url)
            if resp.status_code == 200:
                data = resp.json()
                city = data.get("city") or data.get("locality") or data.get("principalSubdivision") or "Current Location"
                region = data.get("principalSubdivision") or ""
                country = data.get("countryName") or ""
                if city:
                    return {
                        "name": city,
                        "country": country,
                        "region": region,
                        "latitude": latitude,
                        "longitude": longitude
                    }
    except Exception as e:
        print(f"BigDataCloud reverse geocode error: {e}")

    # 2. Fallback: OpenStreetMap Nominatim
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            headers = {"User-Agent": "WeatherGPT/2.0 (weather app geocoding)"}
            nom_url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json"
            resp = await client.get(nom_url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                addr = data.get("address", {})
                city = (
                    addr.get("city")
                    or addr.get("town")
                    or addr.get("village")
                    or addr.get("suburb")
                    or addr.get("county")
                    or addr.get("state_district")
                    or "Current Location"
                )
                region = addr.get("state") or addr.get("state_district") or ""
                country = addr.get("country") or ""
                return {
                    "name": city,
                    "country": country,
                    "region": region,
                    "latitude": latitude,
                    "longitude": longitude
                }
    except Exception as e:
        print(f"Nominatim reverse geocode error: {e}")

    # Final fallback if all providers fail
    return {
        "name": f"{latitude:.2f}°, {longitude:.2f}°",
        "country": "",
        "region": "",
        "latitude": latitude,
        "longitude": longitude
    }
