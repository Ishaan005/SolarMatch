import httpx
from typing import Optional
from fastapi import HTTPException
from .config import settings


class SolarAPIClient:
    """Client for interacting with Google Solar API"""
    
    def __init__(self):
        self.base_url = settings.GOOGLE_SOLAR_API_BASE_URL
        self.api_key = settings.GOOGLE_SOLAR_API_KEY
        
    async def find_closest_building(
        self,
        latitude: float,
        longitude: float,
        required_quality: Optional[str] = None
    ) -> dict:
        """
        Find the closest building insights for a given location.
        
        Args:
            latitude: Latitude of the location
            longitude: Longitude of the location
            required_quality: Optional quality level (LOW, MEDIUM, HIGH)
            
        Returns:
            Building insights data from Google Solar API
        """
        if not settings.is_api_key_configured:
            raise HTTPException(
                status_code=500,
                detail="Google Solar API key is not configured"
            )
        
        url = f"{self.base_url}/buildingInsights:findClosest"
        
        params = {
            "location.latitude": latitude,
            "location.longitude": longitude,
            "key": self.api_key
        }
        
        if required_quality:
            params["requiredQuality"] = required_quality
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Google Solar API error: {e.response.text}"
                )
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=503,
                    detail=f"Failed to connect to Google Solar API: {str(e)}"
                )


solar_client = SolarAPIClient()
