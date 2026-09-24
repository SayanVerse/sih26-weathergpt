from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any

class LocationInfo(BaseModel):
    id: Optional[str] = None
    name: str
    region: Optional[str] = ""
    country: Optional[str] = ""
    latitude: float
    longitude: float
    timezone: Optional[str] = "UTC"
    is_favorite: Optional[bool] = None

    @field_validator("timezone", mode="before")
    @classmethod
    def parse_timezone(cls, v: Any) -> str:
        if v is None:
            return "UTC"
        if isinstance(v, (int, float)):
            hours = int(v) // 3600
            minutes = abs(int(v) % 3600) // 60
            sign = "+" if hours >= 0 else "-"
            return f"UTC{sign}{abs(hours):02d}:{minutes:02d}"
        return str(v)

    @field_validator("country", "region", mode="before")
    @classmethod
    def parse_str_optional(cls, v: Any) -> str:
        return "" if v is None else str(v)

class LocationSearchResult(LocationInfo):
    population: Optional[int] = None
    admin_division: Optional[str] = None
    elevation: Optional[float] = None
