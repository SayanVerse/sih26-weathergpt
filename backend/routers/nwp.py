from fastapi import APIRouter, HTTPException
from typing import Optional
from services.nwp_provider import get_nwp_provider

router = APIRouter(tags=["NWP"])

@router.get("/api/nwp")
async def get_nwp_grid(lat: float, lon: float):
    """
    GET /api/nwp?lat=...&lon=...
    Fetches Numerical Weather Prediction (NWP) model data grids via the configured adapter.
    """
    try:
        provider = get_nwp_provider()
        data = await provider.get_forecast_grid(lat, lon)
        return data
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch NWP data: {str(e)}")
