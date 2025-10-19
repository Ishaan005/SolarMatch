# SolarMatch FastAPI Backend

## Setup

1. Create a virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

4. Configure APIs:
   - **Google Solar API**: Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Edit `.env` and add your Google Solar API key
   - **Database** (Optional for community features):
     - See [Cloud SQL Setup Guide](docs/CLOUD_SQL_SETUP.md) for full instructions
     - Or run the setup script: `./setup_cloud_sql.sh`
     - Without database: Community features use in-memory storage (data lost on restart)

## Database Setup (Optional)

The community solar coordination feature can use either:
- **In-memory storage** (default) - No setup required, data not persisted
- **Cloud SQL PostgreSQL** (recommended for production) - Data persisted to Google Cloud SQL

### Quick Start with Cloud SQL

```bash
# Run automated setup script
./setup_cloud_sql.sh

# Or follow manual instructions
See docs/CLOUD_SQL_SETUP.md for detailed setup guide
```

### Database Management

```bash
# Check database status
python manage_db.py status

# Initialize tables (first time)
python manage_db.py init

# Reset database (development only - DELETES ALL DATA)
python manage_db.py reset
```

The application will automatically:
- ✅ Use PostgreSQL if DATABASE_URL is configured
- ✅ Fall back to in-memory storage if not configured
- ✅ Create tables on first startup
- ✅ Show database status in startup logs

## Running the Backend

### Development Mode (with auto-reload)
```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
✓ Database connection established     <- If DATABASE_URL is set
✓ Database tables verified/created    <- Tables created successfully
⚠ Database not configured            <- If DATABASE_URL not set (uses in-memory)
SolarMatch API ready!
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:
- Interactive API docs (Swagger UI): http://localhost:8000/docs
- Alternative API docs (ReDoc): http://localhost:8000/redoc
- OpenAPI schema: http://localhost:8000/openapi.json

## Project Structure

```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not in git)
├── .env.example        # Example environment variables
└── README.md           # This file
```

## Available Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint (shows if Google Solar API is configured)

### Solar API Endpoints

#### 1. Building Insights
- `GET /api/solar/building-insights` - Get comprehensive solar potential analysis
  - Query params:
    - `latitude` (required): Latitude of the location
    - `longitude` (required): Longitude of the location
    - `quality` (optional): Required quality level (LOW, MEDIUM, HIGH)
  - Example: `/api/solar/building-insights?latitude=37.4450&longitude=-122.1390`
  - Returns: Panel configurations, financial analysis, roof segments, individual panel placement

#### 2. Data Layers (NEW!)
- `GET /api/solar/data-layers` - Get raw solar data layers and imagery
  - Query params:
    - `latitude` (required): Latitude of the location
    - `longitude` (required): Longitude of the location
    - `radius_meters` (optional, default: 50): Radius around location
    - `view` (optional): Data detail level
      - `FULL` - All layers (default)
      - `DSM_LAYER` - Digital Surface Model only
      - `IMAGERY_AND_ANNUAL_FLUX_LAYERS` - Imagery + annual flux
      - `IMAGERY_AND_ALL_FLUX_LAYERS` - Imagery + all flux layers
    - `quality` (optional): Required quality level (LOW, MEDIUM, HIGH)
    - `pixel_size_meters` (optional): Pixel size for resolution control
    - `exact_quality_required` (optional, default: false): Strict quality matching
  - Example: `/api/solar/data-layers?latitude=37.4450&longitude=-122.1390&radius_meters=100`
  - Returns: Download URLs for:
    - RGB imagery (aerial photos)
    - DSM (Digital Surface Model - elevation data)
    - Mask layer (building/roof boundaries)
    - Annual flux (yearly solar irradiance heatmap)
    - Monthly flux (monthly irradiance patterns)
    - Hourly shade (12 time periods showing shade patterns)

### GeoTIFF Processing Endpoints (NEW! 🎨)

These endpoints download and process GeoTIFF files from Google Solar API, converting them to PNG images and providing analysis:

#### 3. RGB Imagery
- `GET /api/solar/rgb-image` - Get aerial/satellite imagery as PNG
  - Query params:
    - `latitude` (required), `longitude` (required)
    - `radius_meters` (optional, default: 50)
    - `max_width` (optional, default: 1024): Max image width
    - `max_height` (optional, default: 1024): Max image height
  - Returns: PNG image of the roof
  - Example: `/api/solar/rgb-image?latitude=37.4221&longitude=-122.0841`

#### 4. Solar Flux Heatmap
- `GET /api/solar/annual-flux-heatmap` - Get solar potential as colored heatmap PNG
  - Query params:
    - `latitude` (required), `longitude` (required)
    - `radius_meters` (optional, default: 50)
    - `colormap` (optional, default: "hot"): hot, viridis, plasma, inferno, magma
    - `max_width`, `max_height` (optional)
  - Returns: PNG heatmap showing solar irradiance
  - Example: `/api/solar/annual-flux-heatmap?latitude=37.4221&longitude=-122.0841&colormap=plasma`

#### 5. Elevation Map
- `GET /api/solar/elevation-map` - Get Digital Surface Model as colored heightmap PNG
  - Query params:
    - `latitude` (required), `longitude` (required)
    - `radius_meters` (optional, default: 50)
    - `colormap` (optional, default: "terrain"): terrain, viridis, rainbow
    - `max_width`, `max_height` (optional)
  - Returns: PNG heightmap showing building elevation
  - Example: `/api/solar/elevation-map?latitude=37.4221&longitude=-122.0841`

#### 6. Roof Mask
- `GET /api/solar/roof-mask` - Get roof/building boundaries as PNG
  - Query params:
    - `latitude` (required), `longitude` (required)
    - `radius_meters` (optional, default: 50)
    - `max_width`, `max_height` (optional)
  - Returns: PNG mask (white=building, black=not building)
  - Example: `/api/solar/roof-mask?latitude=37.4221&longitude=-122.0841`

#### 7. Flux Statistics
- `GET /api/solar/flux-statistics` - Get statistical analysis of solar flux
  - Query params:
    - `latitude` (required), `longitude` (required)
    - `radius_meters` (optional, default: 50)
  - Returns: JSON with min, max, mean, median, std deviation
  - Example: `/api/solar/flux-statistics?latitude=37.4221&longitude=-122.0841`

#### 8. GeoTIFF Metadata
- `GET /api/solar/geotiff-metadata` - Get metadata for a specific layer
  - Query params:
    - `latitude` (required), `longitude` (required)
    - `radius_meters` (optional, default: 50)
    - `layer_type` (required): rgb, dsm, mask, or flux
  - Returns: JSON with dimensions, resolution, bounds, CRS
  - Example: `/api/solar/geotiff-metadata?latitude=37.4221&longitude=-122.0841&layer_type=dsm`

#### 9. Cache Management
- `GET /api/solar/cache-info` - Get cache size and location
- `DELETE /api/solar/cache` - Clear all cached GeoTIFF files
