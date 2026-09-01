from pydantic import BaseModel, Field
from typing import Optional

class LocationInfo(BaseModel):
    id: Optional[str] = None
    name: str
    region: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    timezone: Optional[str] = None
    is_favorite: Optional[bool] = None

class LocationSearchResult(LocationInfo):
    population: Optional[int] = None
    admin_division: Optional[str] = None
    elevation: Optional[float] = None
