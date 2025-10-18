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
            return {"error": "Annual flux data not available."}

        annual_flux_data = await self.processor.download_geotiff(self.data_layers['annualFluxUrl'])
        flux_array, flux_metadata = self.processor.geotiff_to_array(annual_flux_data)
        
        flux_stats = self.processor.get_statistics(flux_array)

        roof_area_sq_meters = 0
        if self.data_layers.get('maskUrl'):
            mask_data = await self.processor.download_geotiff(self.data_layers['maskUrl'])
            mask_array, mask_metadata = self.processor.geotiff_to_array(mask_data)
            
            pixel_size_x, pixel_size_y = mask_metadata.get('resolution', (1.0, 1.0))
            pixel_area = pixel_size_x * pixel_size_y
            
            roof_pixels = np.count_nonzero(mask_array)
            roof_area_sq_meters = roof_pixels * pixel_area

        panel_efficiency = 0.20
        performance_ratio = 0.75
        
        mean_flux = flux_stats.get('mean', 0) or 0
        
        annual_energy_kwh = mean_flux * roof_area_sq_meters * panel_efficiency * performance_ratio

        return {
            "flux_stats": flux_stats,
            "estimated_roof_area_sq_meters": round(roof_area_sq_meters, 2),
            "estimated_annual_energy_kwh": round(annual_energy_kwh, 2),
            "imagery_urls": {
                "rgb": self.data_layers.get('rgbUrl'),
                "dsm": self.data_layers.get('dsmUrl'),
                "mask": self.data_layers.get('maskUrl'),
                "annual_flux": self.data_layers.get('annualFluxUrl'),
            }
        }
