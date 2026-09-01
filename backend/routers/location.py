from fastapi import APIRouter, HTTPException, Request
from typing import List
import os
import json
import httpx

from services.geocoding import search_locations, reverse_geocode
from schemas.location import LocationSearchResult

router = APIRouter(tags=["Location"])

@router.get("/api/location/search")
async def search_location_legacy(query: str):
    """Original endpoint — accepts ?query="""
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")
    results = await search_locations(query)
    return results

@router.get("/api/locations/search", response_model=List[LocationSearchResult])
async def search_location(q: str):
    """
    Frontend-compatible location search.
    GET /api/locations/search?q=London
    Returns list matching LocationSearchResult.
    """
    if not q or len(q.strip()) < 2:
        return []
    results = await search_locations(q.strip())
    # Map backend field names to what the frontend expects
    formatted = []
    for r in results:
        formatted.append({
            "id": str(r.get("id", "")),
            "name": r.get("name", ""),
            "region": r.get("admin1") or r.get("region") or "",
            "country": r.get("country", ""),
            "latitude": r.get("latitude"),
            "longitude": r.get("longitude"),
            "timezone": r.get("timezone"),
            "elevation": r.get("elevation"),
        })
    return formatted

# ── Simple JSON File Storage for Saved Locations ──────────────────────────────
SAVED_LOCATIONS_FILE = "saved_locations.json"

def _read_saved_locations():
    if not os.path.exists(SAVED_LOCATIONS_FILE):
        return []
    try:
        with open(SAVED_LOCATIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _write_saved_locations(data):
    with open(SAVED_LOCATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@router.get("/api/locations/saved")
async def get_saved_locations():
    """GET /api/locations/saved -> returns list of saved locations"""
    return _read_saved_locations()

@router.post("/api/locations/saved")
async def save_location(request: Request):
    """POST /api/locations/saved -> adds a location to the saved list"""
    try:
        new_loc = await request.json()
        locations = _read_saved_locations()
        # Check if already exists
        for loc in locations:
            if loc.get("name", "").lower() == new_loc.get("name", "").lower() and \
               loc.get("country", "").lower() == new_loc.get("country", "").lower():
                return loc
        locations.append(new_loc)
        _write_saved_locations(locations)
        return new_loc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/locations/saved/{loc_id}")
async def delete_saved_location(loc_id: str):
    """DELETE /api/locations/saved/{id} -> removes a location"""
    locations = _read_saved_locations()
    filtered = [loc for loc in locations if str(loc.get("id")) != loc_id]
    _write_saved_locations(filtered)
    return {"status": "success"}

@router.get("/api/location/reverse")
async def reverse_location(lat: float, lon: float):
    """
    Reverse geocode coordinates to a real city name using MapTiler.
    GET /api/location/reverse?lat=22.56&lon=88.36
    """
    result = await reverse_geocode(lat, lon)
    return result

@router.get("/api/location/detect")
async def detect_location_by_ip():
    """
    Detect the user's location by IP using MapTiler Geolocation API.
    Returns city, region, country, lat, lon.
    GET /api/location/detect
    """
    MAPTILER_KEY = "3jIY3RmL6Vmk6ADBLEE9"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://api.maptiler.com/geolocation/ip.json?key={MAPTILER_KEY}",
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
            return {
                "name": data.get("city", "Unknown"),
                "region": data.get("region", ""),
                "country": data.get("country", ""),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "timezone": data.get("timezone", "UTC"),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"IP geolocation failed: {str(e)}")
