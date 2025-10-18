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
