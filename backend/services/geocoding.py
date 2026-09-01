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
    Reverse geocode using MapTiler API.
    """
    MAPTILER_KEY = "3jIY3RmL6Vmk6ADBLEE9"
    url = f"https://api.maptiler.com/geocoding/{longitude},{latitude}.json?key={MAPTILER_KEY}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                features = data.get("features", [])
                
                if features:
                    # MapTiler returns a list of features from most specific to least specific.
                    # We'll try to find city, region, and country from the context of the most relevant feature.
                    feature = features[0]
                    context = feature.get("context", [])
                    
                    city = "Unknown"
                    region = ""
                    country = "Unknown"
                    
                    for item in context:
                        item_id = item.get("id", "")
                        text = item.get("text", "")
                        
                        if item_id.startswith("municipality") or item_id.startswith("city"):
                            city = text
                        elif item_id.startswith("region") or item_id.startswith("state"):
                            region = text
                        elif item_id.startswith("country"):
                            country = text
                            
                    # Sometimes the feature itself is the city
                    feature_id = feature.get("id", "")
                    if feature_id.startswith("municipality") or feature_id.startswith("city"):
                        city = feature.get("text", city)
                        
                    # If we couldn't find a city in context, use the primary text if it's a place/poi
                    if city == "Unknown" and (feature_id.startswith("place") or feature_id.startswith("poi")):
                         city = feature.get("text", city)

                    return {
                        "name": city,
                        "country": country,
                        "region": region,
                        "latitude": latitude,
                        "longitude": longitude
                    }
        except Exception as e:
            print(f"MapTiler reverse geocode failed: {e}")
            
    # Fallback if reverse geocoding fails
    return {
        "name": f"Lat {latitude:.4f}, Lon {longitude:.4f}",
        "country": "Unknown",
        "region": "",
        "latitude": latitude,
        "longitude": longitude
    }
