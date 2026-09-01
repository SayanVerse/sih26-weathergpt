from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
# from geoalchemy2 import Geometry
from database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    country = Column(String)
    admin1 = Column(String) # State / Region
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timezone = Column(String, nullable=False)
    elevation = Column(Float)
    
    # Store as a PostGIS point for geographic queries
    # geom = Column(Geometry(geometry_type='POINT', srid=4326))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    weather_snapshots = relationship("WeatherSnapshot", back_populates="location")

class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    
    # Current condition mapping
    condition = Column(String, nullable=False)
    
    temperature_c = Column(Float)
    apparent_temperature_c = Column(Float)
    humidity_pct = Column(Float)
    wind_speed_kmh = Column(Float)
    wind_direction_deg = Column(Float)
    wind_gusts_kmh = Column(Float)
    precipitation_mm = Column(Float)
    rain_mm = Column(Float)
    cloud_cover_pct = Column(Float)
    is_day = Column(Boolean)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    location = relationship("Location", back_populates="weather_snapshots")
