from fastapi import APIRouter, HTTPException, Query
from schemas.climate import HistoricalClimateResponse
from services.climate_service import get_historical_climate

router = APIRouter(tags=["Climate"])

@router.get("/api/climate/historical", response_model=HistoricalClimateResponse)
async def get_historical_climate_endpoint(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    location_name: str = Query("Unknown", description="Location name"),
    days: int = Query(30, description="Number of days for historical data (max ~90)")
):
    try:
        if days < 7 or days > 365:
            raise HTTPException(status_code=400, detail="Days parameter must be between 7 and 365.")
        return await get_historical_climate(lat=lat, lon=lon, location_name=location_name, days=days)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
