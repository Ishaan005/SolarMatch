"""
Unified Solar Analysis Service
Combines Google Solar API (urban areas with imagery) and PVGIS (rural areas)
"""

from typing import Dict, Any, Optional
from .solar_api import solar_client
from .pvgis_client import pvgis_client
from .resultMath import SolarAnalysis
from .geotiff_processor import geotiff_processor
import logging

logger = logging.getLogger(__name__)


class UnifiedSolarService:
    """
    Intelligent solar analysis that automatically selects the best data source:
    - Google Solar API: Urban areas with high-resolution imagery
    - PVGIS: Rural areas without imagery coverage
    """
    
    def __init__(self):
        self.google_client = solar_client
        self.pvgis_client = pvgis_client
        self.processor = geotiff_processor
    
    async def get_solar_analysis(
        self,
        latitude: float,
        longitude: float,
        radius_meters: float = 50.0,
        estimated_roof_area: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive solar analysis, automatically choosing the best data source.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            radius_meters: Search radius (only used for Google Solar API)
            estimated_roof_area: Manual roof area estimate in m² (optional, for PVGIS fallback)
            
        Returns:
            Unified analysis results with metadata about data source
        """
        
        # Step 1: Try Google Solar API first (best for urban areas)
        try:
            logger.info(f"Attempting Google Solar API for {latitude}, {longitude}")
            
            data_layers = await self.google_client.get_data_layers(
                latitude=latitude,
                longitude=longitude,
                radius_meters=radius_meters
            )
            
            # Check if we have the essential data
            if data_layers.get('annualFluxUrl'):
                logger.info("Google Solar API data available - using high-resolution imagery")
                
                analyzer = SolarAnalysis(data_layers, self.processor)
                result = await analyzer.analyze()
                
                # If analysis was successful, return it
                if not result.get('error'):
                    result['data_source'] = 'Google Solar API'
                    result['has_imagery'] = True
                    result['imagery_quality'] = data_layers.get('imageryQuality', 'MEDIUM')
                    return result
                
                # If analysis failed, fall through to PVGIS
                logger.warning(f"Google Solar API analysis failed: {result.get('error')}")
            else:
                logger.info("Google Solar API returned no imagery data")
                
        except Exception as e:
            logger.warning(f"Google Solar API unavailable: {str(e)}")
        
        # Step 2: Fallback to PVGIS (works everywhere in Europe)
        logger.info(f"Using PVGIS fallback for {latitude}, {longitude}")
        return await self._get_pvgis_analysis(
            latitude, 
            longitude, 
            estimated_roof_area
        )
    
    async def _get_pvgis_analysis(
        self,
        latitude: float,
        longitude: float,
        estimated_roof_area: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Get solar analysis using PVGIS (for rural areas).
        """
        try:
            # Get PVGIS solar radiation data
            pvgis_data = await self.pvgis_client.get_solar_radiation(
                latitude=latitude,
                longitude=longitude
            )
            
            # Estimate roof area if not provided
            # For rural Ireland, typical single-family homes: 80-150 m²
            # Use conservative estimate
            if estimated_roof_area is None:
                estimated_roof_area = 100.0  # Default assumption for rural home
            
            # Calculate energy production
            # PVGIS gives us kWh/kWp/year already
            annual_energy_per_kwp = pvgis_data.get('annual_pv_energy_per_kwp', 0)
            
            # Panel efficiency assumptions
            panel_efficiency = 0.20  # 20% efficient panels
            performance_ratio = 0.75  # 75% performance ratio (losses)
            
            # Calculate how many kWp can fit on the roof
            # 1 kWp ≈ 5-8 m² (we use 6.5 m² as average)
            area_per_kwp = 6.5
            max_capacity_kwp = estimated_roof_area / area_per_kwp
            
            # Annual energy production
            annual_energy_kwh = annual_energy_per_kwp * max_capacity_kwp
            
            # Build response in same format as Google Solar API
            return {
                "data_source": "PVGIS",
                "has_imagery": False,
                "coverage_type": "modeled",
                "note": "Location not covered by Google Solar API imagery. Analysis based on PVGIS satellite-derived solar radiation data.",
                
                "flux_stats": pvgis_data.get('flux_stats', {}),
                
                "estimated_roof_area_sq_meters": estimated_roof_area,
                "estimated_capacity_kwp": round(max_capacity_kwp, 2),
                "estimated_annual_energy_kwh": round(annual_energy_kwh, 2),
                
                "optimal_panel_config": {
                    "tilt_angle": pvgis_data.get('optimal_tilt_angle', 35),
                    "azimuth": pvgis_data.get('optimal_azimuth', 0),
                    "note": "South-facing (azimuth 0°) is optimal in Ireland"
                },
                
                "pvgis_details": {
                    "annual_irradiation_kwh_per_m2": pvgis_data.get('annual_irradiation_kwh_per_m2'),
                    "annual_pv_energy_per_kwp": annual_energy_per_kwp,
                    "monthly_variation": pvgis_data.get('monthly_data', [])
                },
                
                "imagery_urls": None,  # No imagery available
                
                "recommendations": [
                    "Consider manual roof measurement for accurate area calculation",
                    "Local site survey recommended to confirm roof suitability",
                    "Check for shading from trees, buildings, or terrain",
                    f"Optimal panel angle: {pvgis_data.get('optimal_tilt_angle', 35)}° (south-facing)"
                ]
            }
            
        except Exception as e:
            logger.error(f"PVGIS analysis failed: {str(e)}")
            raise Exception(f"Unable to analyze solar potential: {str(e)}")
    
    async def check_coverage(
        self,
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """
        Check what data sources are available for a location.
        
        Returns:
            Information about available data sources and quality
        """
        coverage = {
            "google_solar_api": False,
            "pvgis": False,
            "recommended_source": None,
            "has_imagery": False
        }
        
        # Check Google Solar API
        try:
            data_layers = await self.google_client.get_data_layers(
                latitude=latitude,
                longitude=longitude,
                radius_meters=50.0
            )
            
            if data_layers.get('annualFluxUrl'):
                coverage["google_solar_api"] = True
                coverage["has_imagery"] = True
                coverage["recommended_source"] = "Google Solar API"
                coverage["imagery_quality"] = data_layers.get('imageryQuality', 'UNKNOWN')
        except:
            pass
        
        # Check PVGIS (should work for all of Europe)
        if 35 <= latitude <= 72 and -12 <= longitude <= 42:
            coverage["pvgis"] = True
            if not coverage["google_solar_api"]:
                coverage["recommended_source"] = "PVGIS"
        
        return coverage


# Global instance
unified_solar_service = UnifiedSolarService()
