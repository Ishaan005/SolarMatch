import numpy as np
from .geotiff_processor import geotiff_processor, GeoTIFFProcessor
from typing import Dict, Any

class SolarAnalysis:
    """
    A class to perform solar analysis on data from the Google Solar API.
    """

    def __init__(self, data_layers: Dict[str, Any], processor: GeoTIFFProcessor = geotiff_processor):
        """
        Initializes the SolarAnalysis with data layers from the Solar API.

        Args:
            data_layers (Dict[str, Any]): The data layers dictionary from a call to dataLayers:get.
            processor (GeoTIFFProcessor): An instance of GeoTIFFProcessor.
        """
        self.data_layers = data_layers
        self.processor = processor

    async def analyze(self) -> Dict[str, Any]:
        """
        Performs a comprehensive solar analysis.

        Returns:
            Dict[str, Any]: A dictionary containing the analysis results.
        """
        if not self.data_layers.get('annualFluxUrl'):
            return {
                "error": "Annual flux data not available for this location.",
                "message": "This location may not be covered by Google Solar API. Try a different address in a supported area."
            }

        try:
            annual_flux_data = await self.processor.download_geotiff(self.data_layers['annualFluxUrl'])
            flux_array, flux_metadata = self.processor.geotiff_to_array(annual_flux_data)
            
            flux_stats = self.processor.get_statistics(flux_array)

            roof_area_sq_meters = 0
            usable_roof_area = 0
            theoretically_usable_area = 0
            
            if self.data_layers.get('maskUrl'):
                mask_data = await self.processor.download_geotiff(self.data_layers['maskUrl'])
                mask_array, mask_metadata = self.processor.geotiff_to_array(mask_data)
                
                pixel_size_x, pixel_size_y = mask_metadata.get('resolution', (1.0, 1.0))
                pixel_area = pixel_size_x * pixel_size_y
                
                roof_pixels = np.count_nonzero(mask_array)
                roof_area_sq_meters = roof_pixels * pixel_area
                
                # Calculate usable area based on solar flux quality
                # Use 75% of mean flux as threshold - only high-quality areas
                # This filters out poorly-oriented sections (heavy north-facing, shaded)
                flux_threshold = flux_stats.get('mean', 0) * 0.75
                
                # Mask areas with good flux
                good_flux_mask = flux_array > flux_threshold
                combined_mask = mask_array & good_flux_mask
                usable_pixels = np.count_nonzero(combined_mask)
                theoretically_usable_area = usable_pixels * pixel_area
                
                # Apply realistic reduction factors for actual installation:
                # - Setbacks from edges and ridges: 15%
                # - Obstructions (vents, chimneys, skylights): 15%
                # - Access pathways and safety margins: 10%
                # - Fire safety clearances: 5%
                # Total practical usable: ~55% of theoretically usable area
                # This gives us realistic installable area comparable to professional assessments
                usable_roof_area = theoretically_usable_area * 0.55

            # Panel and system parameters
            panel_efficiency = 0.20  # 20% efficient modern panels (only used if calculating from raw irradiance)
            performance_ratio = 0.82  # 82% system performance (realistic for modern Irish systems)
            area_per_kwp = 5.5  # Modern 400W+ panels: ~5.5 m² per kWp installed
            
            mean_flux = flux_stats.get('mean', 0) or 0
            
            # Calculate system capacity based on usable area
            estimated_capacity_kwp = usable_roof_area / area_per_kwp if usable_roof_area > 0 else 0
            
            # Calculate annual energy production
            # IMPORTANT: mean_flux from Google Solar API is already in kWh/kWp/year
            # It already accounts for panel efficiency and solar irradiance
            # We only need to apply the performance ratio (system losses: inverter, temp, wiring)
            annual_energy_kwh = estimated_capacity_kwp * mean_flux * performance_ratio
            
            # Note: The previous calculation was double-counting efficiency:
            # OLD (WRONG): mean_flux * area * panel_efficiency * performance_ratio
            # This applied efficiency twice since flux is already per kWp
            # NEW (CORRECT): capacity * mean_flux * performance_ratio

            return {
                "flux_stats": flux_stats,
                "estimated_roof_area_sq_meters": round(roof_area_sq_meters, 2),
                "usable_roof_area_sq_meters": round(usable_roof_area, 2),
                "estimated_capacity_kwp": round(estimated_capacity_kwp, 2),
                "estimated_annual_energy_kwh": round(annual_energy_kwh, 2),
                "imagery_urls": {
                    "rgb": self.data_layers.get('rgbUrl'),
                    "dsm": self.data_layers.get('dsmUrl'),
                    "mask": self.data_layers.get('maskUrl'),
                    "annual_flux": self.data_layers.get('annualFluxUrl'),
                },
                "calculation_notes": {
                    "total_roof_area_m2": round(roof_area_sq_meters, 2),
                    "theoretically_usable_area_m2": round(theoretically_usable_area, 2) if usable_roof_area > 0 else 0,
                    "practical_usable_area_m2": round(usable_roof_area, 2),
                    "flux_threshold": "75% of mean (high-quality areas only)",
                    "reduction_factors": "Edge setbacks (15%), obstructions (15%), access/safety (10%), fire clearances (5%) = 55% usable",
                    "area_per_kwp": area_per_kwp,
                    "performance_ratio": performance_ratio,
                    "note": "Conservative estimate aligned with professional solar assessments"
                }
            }
        except Exception as e:
            return {
                "error": f"Failed to process solar data: {str(e)}",
                "message": "An error occurred while analyzing the solar data. Please try again."
            }
