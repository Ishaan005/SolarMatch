from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from core.solar_api import solar_client
from core.config import settings

app = FastAPI(title="SolarMatch API")

# cors to allow requests from NextJS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to SolarMatch API"}


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "google_solar_api_configured": settings.is_api_key_configured
    }


@app.get("/api/solar/building-insights")
async def get_building_insights(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    quality: Optional[str] = Query(None, description="Required quality level (LOW, MEDIUM, HIGH)")
):
    """
    Get solar building insights for a specific location using Google Solar API.
    
    Example: /api/solar/building-insights?latitude=37.4450&longitude=-122.1390
    """
    result = await solar_client.find_closest_building(
        latitude=latitude,
        longitude=longitude,
        required_quality=quality
    )
    return result


@app.get("/api/solar/data-layers")
async def get_data_layers(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters around the location", ge=0),
    view: Optional[str] = Query(
        None, 
        description="Level of detail: FULL, DSM_LAYER, IMAGERY_LAYER, IMAGERY_AND_ANNUAL_FLUX_LAYERS, IMAGERY_AND_ALL_FLUX_LAYERS"
    ),
    quality: Optional[str] = Query(None, description="Required quality level (LOW, MEDIUM, HIGH)"),
    pixel_size_meters: Optional[float] = Query(None, description="Size of each pixel in meters", ge=0),
    exact_quality_required: bool = Query(False, description="Return only exact quality match")
):
    """
    Get raw solar data layers including DSM, RGB imagery, and flux maps.
    
    Returns URLs to download:
    - Digital Surface Model (DSM) - elevation data
    - RGB imagery - aerial/satellite photos
    - Annual flux - yearly solar irradiance
    - Monthly flux - monthly solar irradiance patterns
    - Hourly shade - shade patterns throughout the day
    
    Example: /api/solar/data-layers?latitude=37.4450&longitude=-122.1390&radius_meters=100
    """
    result = await solar_client.get_data_layers(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        view=view,
        required_quality=quality,
        pixel_size_meters=pixel_size_meters,
        exact_quality_required=exact_quality_required
    )
    return result
