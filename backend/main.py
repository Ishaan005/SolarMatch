from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from typing import Optional
from core.solar_api import solar_client
from core.config import settings
from core.geotiff_processor import geotiff_processor

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


# GeoTIFF Processing Endpoints

@app.get("/api/solar/rgb-image")
async def get_rgb_image(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters", ge=0),
    max_width: int = Query(1024, description="Maximum image width", ge=256, le=2048),
    max_height: int = Query(1024, description="Maximum image height", ge=256, le=2048)
):
    """
    Get RGB satellite/aerial imagery as PNG
    
    Downloads the RGB GeoTIFF from Google Solar API and converts it to PNG format.
    
    Example: /api/solar/rgb-image?latitude=37.4450&longitude=-122.1390
    """
    # Get data layers
    data_layers = await solar_client.get_data_layers(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        view="IMAGERY_AND_ANNUAL_FLUX_LAYERS"
    )
    
    if 'rgbUrl' not in data_layers:
        raise HTTPException(status_code=404, detail="RGB imagery not available for this location")
    
    # Download and process
    cache_key = f"rgb_{latitude:.6f}_{longitude:.6f}_{radius_meters}"
    geotiff_data = await geotiff_processor.download_geotiff(data_layers['rgbUrl'], cache_key)
    png_data = geotiff_processor.rgb_geotiff_to_png(geotiff_data, max_size=(max_width, max_height))
    
    return Response(content=png_data, media_type="image/png")


@app.get("/api/solar/annual-flux-heatmap")
async def get_annual_flux_heatmap(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters", ge=0),
    colormap: str = Query("hot", description="Colormap (hot, viridis, plasma, inferno, magma)"),
    max_width: int = Query(1024, description="Maximum image width", ge=256, le=2048),
    max_height: int = Query(1024, description="Maximum image height", ge=256, le=2048)
):
    """
    Get annual solar flux as a colored heatmap PNG
    
    Shows yearly solar irradiance potential across the roof.
    Warmer colors = more solar potential.
    
    Example: /api/solar/annual-flux-heatmap?latitude=37.4450&longitude=-122.1390&colormap=plasma
    """
    # Get data layers
    data_layers = await solar_client.get_data_layers(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        view="IMAGERY_AND_ANNUAL_FLUX_LAYERS"
    )
    
    if 'annualFluxUrl' not in data_layers:
        raise HTTPException(status_code=404, detail="Annual flux data not available for this location")
    
    # Download and process
    cache_key = f"flux_{latitude:.6f}_{longitude:.6f}_{radius_meters}"
    geotiff_data = await geotiff_processor.download_geotiff(data_layers['annualFluxUrl'], cache_key)
    png_data = geotiff_processor.flux_to_heatmap(
        geotiff_data,
        colormap=colormap,
        title='Annual Solar Flux (kWh/kW/year)',
        max_size=(max_width, max_height)
    )
    
    return Response(content=png_data, media_type="image/png")


@app.get("/api/solar/elevation-map")
async def get_elevation_map(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters", ge=0),
    colormap: str = Query("terrain", description="Colormap (terrain, viridis, rainbow)"),
    max_width: int = Query(1024, description="Maximum image width", ge=256, le=2048),
    max_height: int = Query(1024, description="Maximum image height", ge=256, le=2048)
):
    """
    Get Digital Surface Model (elevation) as a colored heightmap PNG
    
    Shows building and roof heights/structure.
    
    Example: /api/solar/elevation-map?latitude=37.4450&longitude=-122.1390
    """
    # Get data layers
    data_layers = await solar_client.get_data_layers(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        view="FULL"
    )
    
    if 'dsmUrl' not in data_layers:
        raise HTTPException(status_code=404, detail="DSM data not available for this location")
    
    # Download and process
    cache_key = f"dsm_{latitude:.6f}_{longitude:.6f}_{radius_meters}"
    geotiff_data = await geotiff_processor.download_geotiff(data_layers['dsmUrl'], cache_key)
    png_data = geotiff_processor.dsm_to_heightmap(
        geotiff_data,
        colormap=colormap,
        title='Digital Surface Model (Elevation)',
        max_size=(max_width, max_height)
    )
    
    return Response(content=png_data, media_type="image/png")


@app.get("/api/solar/roof-mask")
async def get_roof_mask(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters", ge=0),
    max_width: int = Query(1024, description="Maximum image width", ge=256, le=2048),
    max_height: int = Query(1024, description="Maximum image height", ge=256, le=2048)
):
    """
    Get roof/building mask as PNG
    
    Shows precise boundaries of buildings and roofs.
    White = building/roof, Black = not building
    
    Example: /api/solar/roof-mask?latitude=37.4450&longitude=-122.1390
    """
    # Get data layers
    data_layers = await solar_client.get_data_layers(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        view="FULL"
    )
    
    if 'maskUrl' not in data_layers:
        raise HTTPException(status_code=404, detail="Mask data not available for this location")
    
    # Download and process
    cache_key = f"mask_{latitude:.6f}_{longitude:.6f}_{radius_meters}"
    geotiff_data = await geotiff_processor.download_geotiff(data_layers['maskUrl'], cache_key)
    png_data = geotiff_processor.mask_to_png(geotiff_data, max_size=(max_width, max_height))
    
    return Response(content=png_data, media_type="image/png")


@app.get("/api/solar/flux-statistics")
async def get_flux_statistics(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters", ge=0)
):
    """
    Get statistical analysis of solar flux data
    
    Returns min, max, mean, median, and std deviation of solar irradiance.
    
    Example: /api/solar/flux-statistics?latitude=37.4450&longitude=-122.1390
    """
    # Get data layers
    data_layers = await solar_client.get_data_layers(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        view="IMAGERY_AND_ANNUAL_FLUX_LAYERS"
    )
    
    if 'annualFluxUrl' not in data_layers:
        raise HTTPException(status_code=404, detail="Annual flux data not available")
    
    # Download and analyze
    cache_key = f"flux_{latitude:.6f}_{longitude:.6f}_{radius_meters}"
    geotiff_data = await geotiff_processor.download_geotiff(data_layers['annualFluxUrl'], cache_key)
    array, metadata = geotiff_processor.geotiff_to_array(geotiff_data)
    statistics = geotiff_processor.get_statistics(array)
    
    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "radius_meters": radius_meters,
        "statistics": statistics,
        "metadata": {
            "width": metadata['width'],
            "height": metadata['height'],
            "resolution": metadata['resolution'],
            "bounds": metadata['bounds']
        },
        "imagery": {
            "date": data_layers.get('imageryDate'),
            "quality": data_layers.get('imageryQuality')
        }
    }


@app.get("/api/solar/geotiff-metadata")
async def get_geotiff_metadata(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters", ge=0),
    layer_type: str = Query("rgb", description="Layer type: rgb, dsm, mask, flux")
):
    """
    Get metadata for a specific GeoTIFF layer
    
    Returns dimensions, resolution, bounds, coordinate system, etc.
    
    Example: /api/solar/geotiff-metadata?latitude=37.4450&longitude=-122.1390&layer_type=dsm
    """
    # Get data layers
    data_layers = await solar_client.get_data_layers(
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters
    )
    
    # Select appropriate URL based on layer type
    url_map = {
        "rgb": data_layers.get('rgbUrl'),
        "dsm": data_layers.get('dsmUrl'),
        "mask": data_layers.get('maskUrl'),
        "flux": data_layers.get('annualFluxUrl')
    }
    
    url = url_map.get(layer_type.lower())
    if not url:
        raise HTTPException(status_code=404, detail=f"{layer_type} data not available")
    
    # Download and extract metadata
    cache_key = f"{layer_type}_{latitude:.6f}_{longitude:.6f}_{radius_meters}"
    geotiff_data = await geotiff_processor.download_geotiff(url, cache_key)
    metadata = geotiff_processor.read_geotiff_metadata(geotiff_data)
    
    return {
        "layer_type": layer_type,
        "location": {"latitude": latitude, "longitude": longitude},
        "radius_meters": radius_meters,
        "metadata": metadata,
        "imagery": {
            "date": data_layers.get('imageryDate'),
            "quality": data_layers.get('imageryQuality')
        }
    }


@app.delete("/api/solar/cache")
async def clear_geotiff_cache():
    """
    Clear all cached GeoTIFF files
    
    Useful for freeing up disk space or forcing fresh downloads.
    """
    geotiff_processor.clear_cache()
    return {"message": "Cache cleared successfully"}


@app.get("/api/solar/cache-info")
async def get_cache_info():
    """
    Get information about the GeoTIFF cache
    
    Returns cache size and location.
    """
    cache_size = geotiff_processor.get_cache_size()
    return {
        "cache_directory": str(geotiff_processor.cache_dir),
        "cache_size_bytes": cache_size,
        "cache_size_mb": round(cache_size / (1024 * 1024), 2)
    }
