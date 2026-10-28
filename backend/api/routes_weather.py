"""
PlantCare AI - Weather & Environmental Risk Routes
"""

from typing import Optional
from fastapi import APIRouter, Query
from ..services.weather_service import weather_service

router = APIRouter(prefix="/api/weather", tags=["Weather & Environmental Risk"])


@router.get("/risk")
def get_environmental_risk(
    crop: str = Query("Tomato", description="Target crop"),
    temp: float = Query(24.0, description="Temperature in Celsius"),
    humidity: float = Query(75.0, description="Relative humidity percentage (0-100)"),
    wetness_hours: float = Query(6.0, description="Continuous leaf wetness in hours"),
):
    """Calculate environmental risk score and conducive disease list."""
    return weather_service.calculate_disease_risk(
        crop=crop,
        temperature_c=temp,
        humidity_percent=humidity,
        leaf_wetness_hours=wetness_hours,
    )


@router.get("/location-risk")
def get_location_risk(
    location: str = Query("California, USA", description="User farm city/state/region"),
    crop: str = Query("Tomato", description="Crop type"),
):
    """Simulate or fetch regional weather and estimate disease risk."""
    return weather_service.get_risk_for_location(location=location, crop=crop)
