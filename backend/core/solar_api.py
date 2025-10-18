import httpx
from typing import Optional, List
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
    
    async def get_data_layers(
        self,
        latitude: float,
        longitude: float,
        radius_meters: float = 50.0,
        view: Optional[str] = None,
        required_quality: Optional[str] = None,
        pixel_size_meters: Optional[float] = None,
        exact_quality_required: bool = False
    ) -> dict:
        """
        Get raw solar data layers for a location including DSM, RGB imagery, and flux maps.
        
        Args:
            latitude: Latitude of the location
            longitude: Longitude of the location
            radius_meters: Radius in meters around the location (default: 50.0)
            view: Level of detail in response. Options:
                  - None (default): Returns all available layers
                  - "FULL": Complete response with all data
                  - "DSM_LAYER": Digital Surface Model only
                  - "IMAGERY_LAYER": RGB imagery only
                  - "IMAGERY_AND_ANNUAL_FLUX_LAYERS": Imagery + annual flux
                  - "IMAGERY_AND_ALL_FLUX_LAYERS": Imagery + all flux layers
            required_quality: Optional quality level (LOW, MEDIUM, HIGH)
            pixel_size_meters: Size of each pixel in meters (affects resolution)
            exact_quality_required: If True, return only exact quality match
            
        Returns:
            Data layers including:
            - imageryDate: Date of imagery capture
            - imageryProcessedDate: Date of processing
            - dsmUrl: URL to download Digital Surface Model (DSM)
            - rgbUrl: URL to download RGB imagery
            - maskUrl: URL to download mask layer
            - annualFluxUrl: URL to download annual solar flux data
            - monthlyFluxUrl: URL to download monthly solar flux data
            - hourlyShadeUrls: URLs for hourly shade data
            - imageryQuality: Quality of the imagery
        """
        if not settings.is_api_key_configured:
            raise HTTPException(
                status_code=500,
                detail="Google Solar API key is not configured"
            )
        
        url = f"{self.base_url}/dataLayers:get"
        
        params = {
            "location.latitude": latitude,
            "location.longitude": longitude,
            "radiusMeters": radius_meters,
            "key": self.api_key
        }
        
        if view:
            params["view"] = view
        
        if required_quality:
            params["requiredQuality"] = required_quality
        
        if pixel_size_meters:
            params["pixelSizeMeters"] = pixel_size_meters
        
        if exact_quality_required:
            params["exactQualityRequired"] = str(exact_quality_required).lower()
        
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
