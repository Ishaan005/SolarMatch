"""
GeoTIFF processing utilities for Solar API data
Handles downloading, processing, and converting GeoTIFF files
"""
import httpx
import rasterio
import numpy as np
from PIL import Image
import io
import matplotlib.pyplot as plt
from typing import Optional, Tuple, Dict, Any
from pathlib import Path
import tempfile



class GeoTIFFProcessor:
    """Process GeoTIFF files from Google Solar API"""
    
    def __init__(self, cache_dir: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize GeoTIFF processor
        
        Args:
            cache_dir: Directory to cache downloaded files (optional)
            api_key: Google Solar API key for downloading files (optional)
        """
        self.cache_dir = Path(cache_dir) if cache_dir else Path(tempfile.gettempdir()) / "solar_geotiff_cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.api_key = api_key
    
    async def download_geotiff(self, url: str, cache_key: Optional[str] = None, api_key: Optional[str] = None) -> bytes:
        """
        Download a GeoTIFF file from URL
        
        Args:
            url: URL to download from
            cache_key: Optional key for caching (e.g., 'rgb_37.422_-122.084')
            api_key: API key to append to URL (uses instance api_key if not provided)
            
        Returns:
            Raw GeoTIFF file content as bytes
        """
        # Check cache first
        if cache_key:
            cache_file = self.cache_dir / f"{cache_key}.tif"
            if cache_file.exists():
                return cache_file.read_bytes()
        
        # Add API key to URL if provided
        key = api_key or self.api_key
        if key:
            separator = '&' if '?' in url else '?'
            url = f"{url}{separator}key={key}"
        
        # Download file
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.content
            
            # Cache if key provided
            if cache_key:
                cache_file = self.cache_dir / f"{cache_key}.tif"
                cache_file.write_bytes(data)
            
            return data
    
    def read_geotiff_metadata(self, geotiff_data: bytes) -> Dict[str, Any]:
        """
        Extract metadata from GeoTIFF file
        
        Args:
            geotiff_data: Raw GeoTIFF file content
            
        Returns:
            Dictionary with metadata including bounds, CRS, resolution, etc.
        """
        with io.BytesIO(geotiff_data) as f:
            with rasterio.open(f) as src:
                metadata = {
                    "width": src.width,
                    "height": src.height,
                    "count": src.count,  # Number of bands
                    "dtype": str(src.dtypes[0]),
                    "crs": str(src.crs) if src.crs else None,
                    "bounds": {
                        "left": src.bounds.left,
                        "bottom": src.bounds.bottom,
                        "right": src.bounds.right,
                        "top": src.bounds.top
                    },
                    "transform": list(src.transform)[:6],  # Affine transform
                    "resolution": (src.res[0], src.res[1]),
                    "nodata": src.nodata
                }
                return metadata
    
    def geotiff_to_array(self, geotiff_data: bytes) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Convert GeoTIFF to numpy array
        
        Args:
            geotiff_data: Raw GeoTIFF file content
            
        Returns:
            Tuple of (numpy array, metadata dict)
        """
        with io.BytesIO(geotiff_data) as f:
            with rasterio.open(f) as src:
                # Read all bands
                array = src.read()
                metadata = self.read_geotiff_metadata(geotiff_data)
                
                # Squeeze if single band
                if array.shape[0] == 1:
                    array = array[0]
                
                return array, metadata
    
    def rgb_geotiff_to_png(
        self, 
        geotiff_data: bytes, 
        output_path: Optional[str] = None,
        max_size: Tuple[int, int] = (1024, 1024)
    ) -> bytes:
        """
        Convert RGB GeoTIFF to PNG image
        
        Args:
            geotiff_data: Raw GeoTIFF file content
            output_path: Optional path to save PNG
            max_size: Maximum dimensions for output image (width, height)
            
        Returns:
            PNG image data as bytes
        """
        array, metadata = self.geotiff_to_array(geotiff_data)
        
        # Handle different array shapes
        if len(array.shape) == 3:
            # Multi-band image (RGB)
            if array.shape[0] == 3:
                # Transpose from (bands, height, width) to (height, width, bands)
                array = np.transpose(array, (1, 2, 0))
            img_array = array
        else:
            # Single band - convert to RGB by stacking
            img_array = np.stack([array, array, array], axis=-1)
        
        # Normalize to 0-255 if needed
        if img_array.dtype != np.uint8:
            img_array = np.clip(img_array, 0, 255).astype(np.uint8)
        
        # Create PIL Image
        img = Image.fromarray(img_array)
        
        # Resize if larger than max_size
        if img.width > max_size[0] or img.height > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        img.save(output, format='PNG')
        png_data = output.getvalue()
        
        # Optionally save to file
        if output_path:
            Path(output_path).write_bytes(png_data)
        
        return png_data
    
    def flux_to_heatmap(
        self,
        geotiff_data: bytes,
        output_path: Optional[str] = None,
        colormap: str = 'hot',
        title: str = 'Solar Flux',
        max_size: Tuple[int, int] = (1024, 1024)
    ) -> bytes:
        """
        Convert flux GeoTIFF to colored heatmap PNG
        
        Args:
            geotiff_data: Raw GeoTIFF file content
            output_path: Optional path to save PNG
            colormap: Matplotlib colormap name (hot, viridis, plasma, etc.)
            title: Title for the heatmap
            max_size: Maximum dimensions for output image
            
        Returns:
            PNG heatmap image data as bytes
        """
        array, metadata = self.geotiff_to_array(geotiff_data)
        
        # Handle nodata values
        if metadata['nodata'] is not None:
            array = np.ma.masked_equal(array, metadata['nodata'])
        
        # Create figure
        dpi = 100
        figsize = (max_size[0] / dpi, max_size[1] / dpi)
        fig, ax = plt.subplots(figsize=figsize, dpi=dpi)
        
        # Create heatmap
        im = ax.imshow(array, cmap=colormap, aspect='auto')
        ax.set_title(title, fontsize=12, pad=10)
        ax.axis('off')
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.set_label('kWh/kW/year', rotation=270, labelpad=15)
        
        # Tight layout
        plt.tight_layout()
        
        # Save to bytes
        output = io.BytesIO()
        plt.savefig(output, format='PNG', bbox_inches='tight', dpi=dpi)
        plt.close(fig)
        png_data = output.getvalue()
        
        # Optionally save to file
        if output_path:
            Path(output_path).write_bytes(png_data)
        
        return png_data
    
    def dsm_to_heightmap(
        self,
        geotiff_data: bytes,
        output_path: Optional[str] = None,
        colormap: str = 'terrain',
        title: str = 'Elevation (DSM)',
        max_size: Tuple[int, int] = (1024, 1024)
    ) -> bytes:
        """
        Convert DSM (Digital Surface Model) to colored heightmap PNG
        
        Args:
            geotiff_data: Raw GeoTIFF file content
            output_path: Optional path to save PNG
            colormap: Matplotlib colormap name
            title: Title for the heightmap
            max_size: Maximum dimensions for output image
            
        Returns:
            PNG heightmap image data as bytes
        """
        array, metadata = self.geotiff_to_array(geotiff_data)
        
        # Handle nodata values
        if metadata['nodata'] is not None:
            array = np.ma.masked_equal(array, metadata['nodata'])
        
        # Create figure
        dpi = 100
        figsize = (max_size[0] / dpi, max_size[1] / dpi)
        fig, ax = plt.subplots(figsize=figsize, dpi=dpi)
        
        # Create heightmap
        im = ax.imshow(array, cmap=colormap, aspect='auto')
        ax.set_title(title, fontsize=12, pad=10)
        ax.axis('off')
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.set_label('Elevation (meters)', rotation=270, labelpad=15)
        
        # Tight layout
        plt.tight_layout()
        
        # Save to bytes
        output = io.BytesIO()
        plt.savefig(output, format='PNG', bbox_inches='tight', dpi=dpi)
        plt.close(fig)
        png_data = output.getvalue()
        
        # Optionally save to file
        if output_path:
            Path(output_path).write_bytes(png_data)
        
        return png_data
    
    def mask_to_png(
        self,
        geotiff_data: bytes,
        output_path: Optional[str] = None,
        max_size: Tuple[int, int] = (1024, 1024)
    ) -> bytes:
        """
        Convert mask GeoTIFF to PNG (building/roof boundaries)
        
        Args:
            geotiff_data: Raw GeoTIFF file content
            output_path: Optional path to save PNG
            max_size: Maximum dimensions for output image
            
        Returns:
            PNG mask image data as bytes
        """
        array, metadata = self.geotiff_to_array(geotiff_data)
        
        # Convert to binary mask (0 or 255)
        mask_array = (array > 0).astype(np.uint8) * 255
        
        # Create PIL Image
        img = Image.fromarray(mask_array, mode='L')
        
        # Resize if larger than max_size
        if img.width > max_size[0] or img.height > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        img.save(output, format='PNG')
        png_data = output.getvalue()
        
        # Optionally save to file
        if output_path:
            Path(output_path).write_bytes(png_data)
        
        return png_data
    
    def array_to_json(self, array: np.ndarray, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert numpy array to JSON-serializable format
        
        Args:
            array: Numpy array from GeoTIFF
            metadata: Metadata dict
            
        Returns:
            Dictionary with array data and metadata
        """
        # Handle masked arrays
        if isinstance(array, np.ma.MaskedArray):
            array = array.filled(fill_value=-9999)
        
        # Convert to list (can be large!)
        data_list = array.tolist()
        
        return {
            "data": data_list,
            "shape": list(array.shape),
            "dtype": str(array.dtype),
            "metadata": metadata
        }
    
    def get_statistics(self, array: np.ndarray) -> Dict[str, float]:
        """
        Calculate statistics for array data
        
        Args:
            array: Numpy array
            
        Returns:
            Dictionary with min, max, mean, std, median
        """
        # Handle masked arrays
        if isinstance(array, np.ma.MaskedArray):
            array = array.compressed()  # Get non-masked values
        
        # Remove any remaining invalid values
        array = array[np.isfinite(array)]
        
        if len(array) == 0:
            return {
                "min": None,
                "max": None,
                "mean": None,
                "std": None,
                "median": None,
                "count": 0
            } #type: ignore
        
        return {
            "min": float(np.min(array)),
            "max": float(np.max(array)),
            "mean": float(np.mean(array)),
            "std": float(np.std(array)),
            "median": float(np.median(array)),
            "count": int(len(array))
        }
    
    def clear_cache(self):
        """Clear all cached GeoTIFF files"""
        if self.cache_dir.exists():
            for file in self.cache_dir.glob("*.tif"):
                file.unlink()
    
    def get_cache_size(self) -> int:
        """Get total size of cached files in bytes"""
        if not self.cache_dir.exists():
            return 0
        return sum(f.stat().st_size for f in self.cache_dir.glob("*.tif"))


# Global instance
from .config import settings
geotiff_processor = GeoTIFFProcessor(api_key=settings.GOOGLE_SOLAR_API_KEY)
