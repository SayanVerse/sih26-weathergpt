from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/")
async def root():
    return {"message": "Welcome to WeatherGPT API v2", "status": "ok"}

@router.get("/health")
async def health():
    """Health endpoint checked by the frontend BackendStatusBanner."""
    return {"status": "ok", "version": "2.0.0"}

@router.get("/api/health")
async def api_health():
    return {"status": "ok", "version": "2.0.0"}
