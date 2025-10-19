"""
PVGIS (Photovoltaic Geographical Information System) Client
Free EU solar radiation data - excellent coverage for Ireland
https://joint-research-centre.ec.europa.eu/pvgis-photovoltaic-geographical-information-system_en
"""

import httpx
from typing import Dict, Any, Optional
import numpy as np


class PVGISClient:
    """
    Client for PVGIS API - provides solar radiation data for locations worldwide,
    with excellent coverage in Europe including rural Ireland.
    """
    
    BASE_URL = "https://re.jrc.ec.europa.eu/api/v5_2"
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def get_solar_radiation(
        self, 
        latitude: float, 
        longitude: float,
        pv_tech: str = "crystSi",  # crystalline silicon (most common)
        mounting: str = "free",     # free-standing
        loss: float = 14.0,         # system losses (%)
        optimal_angle: bool = True   # calculate optimal tilt angle
    ) -> Dict[str, Any]:
        """
        Get solar radiation data for a location.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            pv_tech: PV technology (crystSi, CIS, CdTe, Unknown)
            mounting: Mounting type (free, building)
            loss: System losses percentage (0-100)
            optimal_angle: If True, calculates optimal tilt angle
            
        Returns:
            Dictionary with solar radiation data and estimates
        """
        try:
            # PVcalc endpoint - provides detailed calculations
            params = {
                "lat": latitude,
                "lon": longitude,
                "peakpower": 1,  # 1 kW for calculations
                "loss": loss,
                "pvtechchoice": pv_tech,
                "mountingplace": mounting,
                "outputformat": "json"
            }
            
            if optimal_angle:
                params["optimalangles"] = 1
            else:
                # Default tilt for Ireland (latitude-based)
                params["angle"] = round(abs(latitude))
                params["aspect"] = 0  # South-facing
            
            response = await self.client.get(
                f"{self.BASE_URL}/PVcalc",
                params=params
            )
            response.raise_for_status()
            data = response.json()
            
            return self._process_pvgis_response(data, latitude, longitude)
            
        except httpx.HTTPError as e:
            raise Exception(f"PVGIS API error: {str(e)}")
    
    async def get_monthly_radiation(
        self,
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """
        Get monthly solar radiation data (simpler endpoint, faster).
        
        Returns:
            Monthly radiation statistics
        """
        try:
            params = {
                "lat": latitude,
                "lon": longitude,
                "outputformat": "json"
            }
            
            response = await self.client.get(
                f"{self.BASE_URL}/seriescalc",
                params=params
            )
            response.raise_for_status()
            data = response.json()
            
            return data
            
        except httpx.HTTPError as e:
            raise Exception(f"PVGIS monthly data error: {str(e)}")
    
    def _process_pvgis_response(
        self, 
        data: Dict[str, Any],
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """
        Process PVGIS response into our standard format.
        """
        try:
            outputs = data.get("outputs", {})
            totals = outputs.get("totals", {})
            monthly = outputs.get("monthly", {})
            
            # Annual solar irradiation (kWh/m²/year)
            annual_irradiation = totals.get("fixed", {}).get("H(i)_y")
            
            # PV energy output per kWp installed (kWh/kWp/year)
            annual_pv_energy_per_kwp = totals.get("fixed", {}).get("E_y")
            
            # Calculate statistics similar to Google Solar API format
            monthly_values = []
            if isinstance(monthly, dict) and "fixed" in monthly:
                for month_data in monthly["fixed"]:
                    monthly_values.append(month_data.get("H(i)", 0))
            
            # Convert to flux-like values (kWh/kW/year)
            # PVGIS gives kWh/kWp/year, which is essentially the same
            mean_flux = annual_pv_energy_per_kwp if annual_pv_energy_per_kwp else 0
            
            # Estimate min/max based on monthly variation
            flux_stats = {
                "mean": mean_flux,
                "min": min(monthly_values) * 12 if monthly_values else mean_flux * 0.4,
                "max": max(monthly_values) * 12 if monthly_values else mean_flux * 1.4,
                "std": float(np.std(monthly_values) * 12) if monthly_values else mean_flux * 0.15
            }
            
            # Extract system parameters
            inputs = data.get("inputs", {})
            optimal_angle = inputs.get("mounting_system", {}).get("fixed", {}).get("slope", {}).get("value", 35)
            optimal_azimuth = inputs.get("mounting_system", {}).get("fixed", {}).get("azimuth", {}).get("value", 0)
            
            return {
                "source": "PVGIS",
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "flux_stats": flux_stats,
                "annual_irradiation_kwh_per_m2": annual_irradiation,
                "annual_pv_energy_per_kwp": annual_pv_energy_per_kwp,
                "optimal_tilt_angle": optimal_angle,
                "optimal_azimuth": optimal_azimuth,
                "monthly_data": monthly_values,
                "coverage": "Available",
                "data_quality": "Modeled",  # PVGIS uses satellite + climate models
                "note": "Solar potential estimated using PVGIS EU database - no high-resolution imagery available for this location"
            }
            
        except Exception as e:
            raise Exception(f"Error processing PVGIS data: {str(e)}")


# Global instance
pvgis_client = PVGISClient()
