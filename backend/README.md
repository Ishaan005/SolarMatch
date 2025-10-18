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

3. Set up your Google Solar API key:
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Solar API for your project
   - Copy `.env.example` to `.env` and add your API key:
```bash
cp .env.example .env
# Edit .env and replace YOUR_API_KEY with your actual Google Solar API key
```

## Running the Backend

### Development Mode (with auto-reload)
```bash
uvicorn main:app --reload --port 8000
```

Or with custom host and port:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
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
