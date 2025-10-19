from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from typing import Optional
from pydantic import BaseModel
from core.solar_api import solar_client
from core.config import settings
from core.geotiff_processor import geotiff_processor
from core.unified_solar_service import unified_solar_service
# Import chatbot components
from core.chatbot import ChatbotService, ChatRequest, ChatResponse
from core.chatbot.models import PredefinedQuestionsResponse, HealthCheckResponse as ChatbotHealthResponse

from core.community_service import community_service
from models.coop_models import (
    CommunityStatus, CreateCommunityRequest, JoinCommunityRequest
)
from core.database import init_database, create_tables
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SolarMatch API")

# Initialize chatbot service
chatbot_service = None

# cors to allow requests from NextJS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    logger.info("Starting up SolarMatch API...")
    
    # Initialize database
    db_initialized = init_database()
    if db_initialized:
        logger.info("✓ Database connection established")
        
        # Create tables if they don't exist
        try:
            create_tables()
            logger.info("✓ Database tables verified/created")
        except Exception as e:
            logger.warning(f"Could not create tables (they may already exist): {e}")
        
        # IMPORTANT: Reset the repository's cached database check
        # This ensures the repository knows the database is now available
        community_service.repository.reset_database_cache()
        logger.info("✓ Repository configured to use database")
        
        # Initialize sample community data (only if database is empty)
        community_service.ensure_sample_data()
    else:
        logger.warning("⚠ Database not configured - using in-memory storage for community features")
        logger.info("  To enable database: Set DATABASE_URL in .env file")
        # Still initialize sample data for in-memory storage
        community_service.ensure_sample_data()
    
    logger.info("SolarMatch API ready!")


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


@app.get("/api/solar/coverage")
async def check_solar_coverage(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location")
):
    """
    Check what solar data sources are available for a location.
    
    Useful for determining if high-resolution imagery is available
    or if modeled data (PVGIS) will be used.
    """
    try:
        coverage = await unified_solar_service.check_coverage(
            latitude=latitude,
            longitude=longitude
        )
        return coverage
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking coverage: {str(e)}")


@app.get("/api/solar/analysis")
async def get_solar_analysis(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    radius_meters: float = Query(50.0, description="Radius in meters", ge=0),
    estimated_roof_area: Optional[float] = Query(None, description="Estimated roof area in m² (for fallback analysis)")
):
    """
    Performs a full solar analysis for a location.
    
    Automatically uses the best available data source:
    - Google Solar API: For urban areas with high-resolution imagery
    - PVGIS: For rural areas without imagery coverage (all of Europe including Ireland)
    
    Returns comprehensive solar potential analysis with financial estimates.
    """
    try:
        # Use unified service - automatically selects best data source
        results = await unified_solar_service.get_solar_analysis(
            latitude=latitude,
            longitude=longitude,
            radius_meters=radius_meters,
            estimated_roof_area=estimated_roof_area
        )

        return results
        
    except Exception as e:
        print(f"Error in solar analysis: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Unable to analyze solar potential for this location: {str(e)}"
        )


# ===== CHATBOT ENDPOINTS =====

@app.post("/api/chatbot", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    """
    Chat with the solar energy AI assistant.
    
    Supports conversation history and session management.
    
    Example request:
    {
        "message": "What solar grants are available in Ireland?",
        "session_id": "optional-session-id",
        "conversation_history": []
    }
    """
    if chatbot_service is None:
        raise HTTPException(
            status_code=503,
            detail="Chatbot service not initialized. Please try again in a moment."
        )
    
    try:
        response = await chatbot_service.handle_chat(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Chatbot error: {str(e)}"
        )


@app.get("/api/chatbot/questions", response_model=PredefinedQuestionsResponse)
async def get_predefined_questions():
    """
    Get list of predefined showcase questions for the chatbot.
    
    Useful for providing quick-start prompts to users.
    """
    if chatbot_service is None:
        raise HTTPException(status_code=503, detail="Chatbot service not initialized")
    return chatbot_service.get_predefined_questions()


@app.delete("/api/chatbot/session/{session_id}")
async def clear_chat_session(session_id: str):
    """
    Clear a specific chat session's conversation history.
    
    Returns success status.
    """
    if chatbot_service is None:
        raise HTTPException(status_code=503, detail="Chatbot service not initialized")
    
    success = chatbot_service.clear_session(session_id)
    if success:
        return {"message": f"Session {session_id} cleared successfully"}
    else:
        raise HTTPException(
            status_code=404, 
            detail=f"Session {session_id} not found"
        )


@app.get("/api/chatbot/health")
async def chatbot_health_check():
    """
    Check chatbot service health and API connectivity.
    """
    if chatbot_service is None:
        return {
            "status": "initializing",
            "gemini_api_configured": False,
            "gemini_api_accessible": False,
            "model": "unknown",
            "active_sessions": 0
        }
    
    health = await chatbot_service.health_check()
    return health



# Community Solar Coordination Platform Endpoints

@app.get("/api/coops/search")
async def search_communities(
    latitude: Optional[float] = Query(None, description="User's latitude for distance calculation"),
    longitude: Optional[float] = Query(None, description="User's longitude for distance calculation"),
    max_distance_km: Optional[float] = Query(50.0, description="Maximum distance in km"),
    county: Optional[str] = Query(None, description="Filter by county"),
    status: Optional[str] = Query(None, description="Filter by status (planning, coordinating, active)"),
    accepting_participants: bool = Query(True, description="Only show communities accepting participants")
):
    """
    Search for community solar projects near a location.
    
    Returns list of communities with:
    - Basic info (name, description, location)
    - Distance from user
    - Participation status
    - Bulk discount percentage
    - Aggregate solar potential
    """
    try:
        # Parse status filter
        status_filter = None
        if status:
            try:
                status_filter = [CommunityStatus(status)]
            except ValueError:
                pass
        
        results = await community_service.search_communities(
            latitude=latitude,
            longitude=longitude,
            max_distance_km=max_distance_km or 50.0,
            county=county,
            status=status_filter,
            accepting_participants=accepting_participants
        )
        
        return {
            "count": len(results),
            "coops": results  # Keep 'coops' key for frontend compatibility
        }
        
    except Exception as e:
        print(f"Error searching communities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching communities: {str(e)}")


@app.get("/api/coops/{coop_id}")
async def get_community_details(coop_id: str):
    """
    Get detailed information about a specific community project.
    
    Returns complete community data including:
    - Aggregate solar potential
    - Participant information
    - Bulk discount estimates
    - Coordinator contact
    """
    community = community_service.get_community(coop_id)
    
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    return community


@app.get("/api/coops/{coop_id}/dashboard")
async def get_community_dashboard(coop_id: str):
    """
    Get dashboard data for a community project.
    
    Returns:
    - Participation metrics
    - Aggregate energy potential
    - Cost savings from coordination
    - Environmental impact
    """
    dashboard = community_service.get_community_dashboard(coop_id)
    
    if not dashboard:
        raise HTTPException(status_code=404, detail="Community not found")
    
    return dashboard


@app.post("/api/coops/create")
async def create_community(request: CreateCommunityRequest):
    """
    Create a new community solar coordination project.
    
    Initializes a community project for coordinating solar installations.
    No shares or investments - just collaborative planning for bulk discounts.
    
    The community starts in PLANNING status.
    """
    try:
        print(f"Received create request: {request}")
        result = await community_service.create_community(request)
        return {
            "success": True,
            "community_id": result["community_id"],
            "coop_id": result["community_id"],  # Keep for frontend compatibility
            "coop": result["community"]  # Keep for frontend compatibility
        }
    except Exception as e:
        print(f"Error creating community: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating community: {str(e)}")


@app.post("/api/coops/join")
async def join_community(request: JoinCommunityRequest):
    """
    Join a community solar project.
    
    Adds your home to the community coordination effort.
    Optionally performs solar analysis on your specific address.
    
    No payment required - just coordination and planning.
    """
    try:
        result = await community_service.join_community(request)
        return {
            "success": True,
            "participant_id": result["participant_id"],
            "member_id": result["participant_id"],  # Keep for frontend compatibility
            "message": "Successfully joined community project",
            "member": result["participant"]  # Keep for frontend compatibility
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error joining community: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error joining community: {str(e)}")
