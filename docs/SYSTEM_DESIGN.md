# SolarMatch - System Design & Architecture Documentation

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Technology Stack](#technology-stack)
6. [API Design](#api-design)
7. [Database Schema](#database-schema)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability & Performance](#scalability--performance)

---

## Executive Summary

**SolarMatch** is a full-stack web application that empowers homeowners to:
- Analyze their property's solar potential using AI & satellite data
- Calculate costs, savings, and ROI for solar panel installations
- Form community solar cooperatives with neighbours for bulk purchasing discounts

**Key Features:**
- 🛰️ Dual-source solar analysis (Google Solar API + PVGIS)
- 💰 Financial modeling with payback calculations
- 🏘️ Community coordination platform
- 📊 Interactive visualizations (heatmaps, 3D globe)
- 📄 PDF report generation

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                              Internet                                 │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │   Cloud Load Balancer│
                └──────────┬──────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
        ▼                                      ▼
┌────────────────┐                    ┌────────────────┐
│  Cloud Run     │                    │  Cloud Run     │
│  (Frontend)    │◄───────────────────┤  (Backend)     │
│                │    REST API        │                │
│  Next.js 15    │                    │  FastAPI       │
│  React 19      │                    │  Python 3.11   │
│  Tailwind CSS  │                    │                │
└────────────────┘                    └───────┬────────┘
                                              │
                    ┌─────────────────────────┼─────────────────┐
                    │                         │                 │
                    ▼                         ▼                 ▼
           ┌─────────────────┐      ┌─────────────┐   ┌──────────────┐
           │  Cloud SQL      │      │  Google     │   │    PVGIS     │
           │  PostgreSQL     │      │  Solar API  │   │    API       │
           │                 │      │             │   │   (EU JRC)   │
           │  - Communities  │      │  - Imagery  │   │  - Rural     │
           │  - Participants │      │  - Analysis │   │    Coverage  │
           └─────────────────┘      └─────────────┘   └──────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │  Secret Manager │
           │  - API Keys     │
           │  - DB Creds     │
           └─────────────────┘
```

---

## Component Architecture

### Frontend Architecture (Next.js)

```
app/
├── page.tsx                    # Landing page with hero
├── layout.tsx                  # Root layout, providers
├── globals.css                 # Tailwind styles
│
├── analyze/                    # 🔍 Address Search Module
│   ├── page.tsx               # Address input, autocomplete
│   └── GlobeComponent.tsx     # 3D interactive globe
│
├── results/                    # 📊 Solar Analysis Module
│   └── page.tsx               # Results dashboard, visualizations
│
├── coops/                      # 🏘️ Community Coordination Module
│   ├── page.tsx               # List communities, search
│   ├── create/
│   │   └── page.tsx          # Create new community
│   └── [id]/
│       └── page.tsx          # Community details, join
│
├── platform/                   # ℹ️ Info/About Module
│   └── page.tsx
│
└── api/                        # 🔌 API Routes (Next.js)
    ├── autocomplete/          # Google Places autocomplete
    │   └── route.ts
    └── geocode/               # Address to coordinates
        └── route.ts

components/
├── Hero.tsx                    # Landing page hero
├── Header.tsx                  # Navigation
├── FeatureCard.tsx            # Feature highlights
├── FloatingHelp.tsx           # Help widget
├── theme-provider.tsx         # Dark mode support
└── community/                 # Community-specific components
    ├── CommunityCard.tsx
    ├── CommunityDetailHeader.tsx
    ├── CommunityStats.tsx
    ├── CoordinatorCard.tsx
    ├── CostSavingsCard.tsx
    ├── JoinModal.tsx
    ├── ParticipationStatusCard.tsx
    └── SolarPotentialCard.tsx

lib/
└── pdfGenerator.ts            # PDF export functionality
```

### Backend Architecture (FastAPI)

```
backend/
├── main.py                     # FastAPI app, routes, startup logic
│
├── core/                       # 🧠 Business Logic Layer
│   ├── config.py              # Environment configuration
│   ├── database.py            # SQLAlchemy setup, sessions
│   │
│   ├── unified_solar_service.py   # 🌞 MAIN SOLAR LOGIC
│   │   ├── Intelligent source selection
│   │   ├── Google Solar API (urban)
│   │   └── PVGIS fallback (rural)
│   │
│   ├── solar_api.py           # Google Solar API client
│   ├── pvgis_client.py        # PVGIS API client
│   ├── resultMath.py          # Financial calculations
│   ├── geotiff_processor.py   # GeoTIFF → PNG processing
│   │
│   ├── community_service.py   # Community business logic
│   └── community_repository.py # Data access layer
│
├── models/                     # 📦 Data Models
│   ├── db_models.py           # SQLAlchemy ORM models
│   └── coop_models.py         # Pydantic schemas
│
├── output/                     # 💾 Cache Directory
│   └── geotiff cache files
│
└── tests/                      # 🧪 Unit Tests
    ├── test_solar_api.py
    ├── test_geotiff.py
    └── test_data_layers.py
```

---

## Data Flow Diagrams

### 1. Solar Analysis Flow (Primary Feature)

```
┌─────────────┐
│   User      │
│ Enters      │
│ Address     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: /analyze                                      │
│  - Google Places Autocomplete                           │
│  - Geocode address → lat/lng                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼ Navigate to /results
┌─────────────────────────────────────────────────────────┐
│  Frontend: /results                                      │
│  - Display loading state                                │
│  - Fetch /api/solar/analysis?lat=X&lng=Y                │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP GET
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: unified_solar_service                          │
│  DECISION TREE:                                         │
│  1. Try Google Solar API                                │
│     ├─ Urban areas with imagery ✅                      │
│     │  - Get building insights                          │
│     │  - Download GeoTIFF layers                        │
│     │  - Process roof segments                          │
│     │  - Calculate solar panels                         │
│     └─ No imagery found ❌ → Try PVGIS                  │
│                                                         │
│  2. PVGIS Fallback (Rural Ireland)                      │
│     - Get solar radiation data                          │
│     - Estimate roof area                                │
│     - Calculate production                              │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌────────────┐
│ Google Solar │ │  PVGIS   │ │ resultMath │
│     API      │ │   API    │ │   Module   │
│              │ │          │ │            │
│ - Imagery    │ │ - EU     │ │ - Cost     │
│ - Roof data  │ │   Solar  │ │ - Savings  │
│ - Flux maps  │ │   Data   │ │ - Payback  │
└──────────────┘ └──────────┘ └────────────┘
        │              │              │
        └──────────────┴──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Response JSON:                                          │
│  {                                                      │
│    "status": "success",                                 │
│    "source": "google_solar" | "pvgis",                 │
│    "address": "...",                                    │
│    "solarPotential": {                                  │
│      "maxArrayPanelsCount": 24,                        │
│      "maxArrayArea": 40.8,                             │
│      "annualProduction": 8500                          │
│    },                                                   │
│    "installationCost": 12000,                          │
│    "annualSavings": 1530,                              │
│    "paybackYears": 7.8,                                │
│    "co2Offset": 3.4,                                   │
│    "imagery": { ... }                                   │
│  }                                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: /results                                      │
│  - Display metrics cards                                │
│  - Show solar panel layouts                            │
│  - Render flux heatmaps                                │
│  - Financial breakdown                                 │
│  - PDF export button                                   │
│  - "Find Community" CTA                                │
└─────────────────────────────────────────────────────────┘
```

### 2. Community Coordination Flow

```
┌─────────────┐
│   User      │
│ Clicks      │
│ "Find Coops"│
└──────┬──────┘
       │
       ▼ Navigate to /coops
┌─────────────────────────────────────────────────────────┐
│  Frontend: /coops                                        │
│  - Search communities near location                     │
│  - Fetch /api/coops/search?lat=X&lng=Y                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP GET
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: community_service                              │
│  1. Query database for communities                      │
│  2. Calculate distance from user                        │
│  3. Filter by max distance, county, status              │
│  4. Return list with:                                   │
│     - Community info                                    │
│     - Participant count                                 │
│     - Aggregate solar potential                         │
│     - Bulk discount estimate                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │   PostgreSQL/In-Memory │
          │   - communities table  │
          │   - participants table │
          └────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: /coops                                        │
│  - Display community cards                              │
│  - Show distance, status                                │
│  - "Create Community" option                            │
└─────────────────────────────────────────────────────────┘
       │
       │ User clicks community
       ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: /coops/[id]                                   │
│  - Fetch /api/coops/{id}                                │
│  - Display full details                                 │
│  - Coordinator info                                     │
│  - Aggregate metrics                                    │
│  - "Join Community" button                              │
└──────────────────────┬──────────────────────────────────┘
                       │ User joins
                       ▼ POST /api/coops/join
┌─────────────────────────────────────────────────────────┐
│  Backend: community_service.join_community()             │
│  1. Validate community exists & accepting               │
│  2. Optionally analyze user's address                   │
│  3. Create participant record                           │
│  4. Update community aggregates                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Database: INSERT participant                            │
│  - participant_id                                       │
│  - community_id                                         │
│  - address, solar_data                                  │
│  - status: "interested"                                 │
└─────────────────────────────────────────────────────────┘
```

### 3. GeoTIFF Processing Flow (Advanced Feature)

```
Google Solar API
       │
       ▼ Returns GeoTIFF URLs
┌─────────────────────────────────────┐
│  geotiff_processor                  │
│                                     │
│  1. Download GeoTIFF from URL       │
│     ├─ RGB imagery                  │
│     ├─ DSM (elevation)              │
│     ├─ Annual flux (solar)          │
│     └─ Mask (building outline)      │
│                                     │
│  2. Parse with rasterio             │
│     - Extract numpy array           │
│     - Get metadata (bounds, CRS)    │
│                                     │
│  3. Process & Convert               │
│     ├─ RGB → PNG (PIL)              │
│     ├─ Flux → Heatmap (matplotlib)  │
│     ├─ DSM → Heightmap              │
│     └─ Mask → Binary PNG            │
│                                     │
│  4. Cache locally                   │
│     - output/ directory             │
│     - Avoid re-downloading          │
└─────────────────┬───────────────────┘
                  │
                  ▼ Return PNG bytes
┌─────────────────────────────────────┐
│  FastAPI Response(                  │
│    content=png_data,                │
│    media_type="image/png"           │
│  )                                  │
└─────────────────────────────────────┘
                  │
                  ▼ <img src="/api/solar/flux-heatmap">
┌─────────────────────────────────────┐
│  Frontend displays visualization    │
└─────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.6 | React framework, SSR, routing |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.23.24 | Animations |
| **react-globe.gl** | 2.36.0 | 3D globe visualization |
| **jsPDF** | 3.0.3 | PDF generation |
| **html2canvas** | 1.4.1 | DOM to canvas conversion |
| **Three.js** | 0.180.0 | 3D graphics (via globe) |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115.0 | REST API framework |
| **Python** | 3.11 | Programming language |
| **Uvicorn** | 0.32.0 | ASGI server |
| **SQLAlchemy** | 2.0.35 | ORM for database |
| **PostgreSQL** | (Cloud SQL) | Relational database |
| **psycopg2-binary** | 2.9.10 | PostgreSQL adapter |
| **httpx** | 0.27.2 | Async HTTP client |
| **rasterio** | 1.4.3 | GeoTIFF processing |
| **numpy** | 2.1.3 | Numerical computing |
| **Pillow** | 11.0.0 | Image processing |
| **matplotlib** | 3.9.3 | Heatmap generation |

### Infrastructure Stack

| Service | Purpose |
|---------|---------|
| **Google Cloud Run** | Serverless container deployment |
| **Cloud SQL (PostgreSQL)** | Managed database |
| **Artifact Registry** | Docker image storage |
| **Secret Manager** | Secure credential storage |
| **Cloud Build** | CI/CD pipeline |

### External APIs

| API | Purpose |
|-----|---------|
| **Google Solar API** | Satellite imagery, solar analysis (urban) |
| **PVGIS API** | Solar radiation data (rural Europe) |
| **Google Places API** | Address autocomplete |
| **Google Geocoding API** | Address → coordinates |

---

## API Design

### Frontend API Routes (Next.js)

```typescript
// Internal API routes (proxies to Google APIs)

GET /api/autocomplete
  Query: ?input=<address>
  Returns: { predictions: [...] }
  Purpose: Address autocomplete suggestions

GET /api/geocode
  Query: ?address=<full address>
  Returns: { lat, lng, formatted_address }
  Purpose: Convert address to coordinates

GET /api/health
  Returns: { status: "healthy", timestamp, service }
  Purpose: Frontend health check
```

### Backend API Routes (FastAPI)

#### Solar Analysis Endpoints

```python
GET /api/health
  Returns: { status, google_solar_api_configured }

GET /api/solar/coverage
  Query: ?latitude=X&longitude=Y
  Returns: {
    google_solar: { available: bool },
    pvgis: { available: bool },
    recommended_source: "google_solar" | "pvgis"
  }

GET /api/solar/analysis
  Query: ?latitude=X&longitude=Y&radius_meters=50
  Returns: {
    status: "success",
    source: "google_solar" | "pvgis",
    address: string,
    solarPotential: { ... },
    installationCost: number,
    annualSavings: number,
    paybackYears: number,
    co2Offset: number,
    imagery: { ... } | null
  }

GET /api/solar/building-insights
  Query: ?latitude=X&longitude=Y&quality=HIGH
  Returns: Raw Google Solar API building insights

GET /api/solar/data-layers
  Query: ?latitude=X&longitude=Y&radius_meters=50&view=FULL
  Returns: {
    rgbUrl, dsmUrl, maskUrl, annualFluxUrl,
    imageryDate, imageryQuality
  }
```

#### GeoTIFF Visualization Endpoints

```python
GET /api/solar/rgb-image
  Query: ?latitude=X&longitude=Y&radius_meters=50
  Returns: PNG image (satellite/aerial view)

GET /api/solar/annual-flux-heatmap
  Query: ?latitude=X&longitude=Y&colormap=hot
  Returns: PNG heatmap (solar potential visualization)

GET /api/solar/elevation-map
  Query: ?latitude=X&longitude=Y&colormap=terrain
  Returns: PNG heightmap (building elevation)

GET /api/solar/roof-mask
  Query: ?latitude=X&longitude=Y
  Returns: PNG mask (building boundaries)

GET /api/solar/flux-statistics
  Query: ?latitude=X&longitude=Y
  Returns: {
    min, max, mean, median, std_dev,
    metadata: { width, height, bounds }
  }

DELETE /api/solar/cache
  Returns: { message: "Cache cleared" }
  Purpose: Clear GeoTIFF cache

GET /api/solar/cache-info
  Returns: { cache_directory, cache_size_bytes, cache_size_mb }
```

#### Community Coordination Endpoints

```python
GET /api/coops/search
  Query: ?latitude=X&longitude=Y&max_distance_km=50
         &county=Dublin&status=active&accepting_participants=true
  Returns: {
    count: number,
    coops: [
      {
        id, name, description, location,
        status, coordinator, participant_count,
        aggregate_solar_potential, bulk_discount_estimate,
        distance_km, accepting_participants
      }
    ]
  }

GET /api/coops/{coop_id}
  Returns: Full community details + participants + dashboard data

GET /api/coops/{coop_id}/dashboard
  Returns: {
    total_participants, aggregate_energy_kwh,
    total_cost_savings, co2_offset,
    avg_payback_years, bulk_discount_percentage
  }

POST /api/coops/create
  Body: {
    name, description, location, coordinator,
    min_participants, max_participants
  }
  Returns: { success: true, community_id, coop }

POST /api/coops/join
  Body: {
    community_id, participant_name, address,
    phone, email, analyze_address
  }
  Returns: { success: true, participant_id, member }
```

---

## Database Schema

### PostgreSQL Tables

```sql
-- Community Projects Table
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location
    county VARCHAR(100),
    town VARCHAR(100),
    lat FLOAT,
    lng FLOAT,
    
    -- Coordinator
    coordinator_name VARCHAR(255),
    coordinator_email VARCHAR(255),
    coordinator_phone VARCHAR(50),
    
    -- Constraints
    min_participants INT DEFAULT 5,
    max_participants INT DEFAULT 50,
    
    -- Status
    status VARCHAR(50) DEFAULT 'planning',
        -- planning | coordinating | active | completed
    accepting_participants BOOLEAN DEFAULT TRUE,
    
    -- Aggregates (calculated)
    total_potential_kwh FLOAT DEFAULT 0,
    aggregate_cost_savings FLOAT DEFAULT 0,
    bulk_discount_percentage FLOAT DEFAULT 0,
    participant_count INT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participant/Home Table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    
    -- Participant Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    
    -- Location
    lat FLOAT,
    lng FLOAT,
    
    -- Solar Analysis Results
    roof_area FLOAT,
    panel_count INT,
    annual_production_kwh FLOAT,
    installation_cost FLOAT,
    annual_savings FLOAT,
    payback_years FLOAT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'interested',
        -- interested | analyzing | committed | installed
    
    -- Metadata
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solar_analyzed_at TIMESTAMP,
    
    UNIQUE(community_id, email)
);

-- Indexes for Performance
CREATE INDEX idx_communities_location ON communities(lat, lng);
CREATE INDEX idx_communities_status ON communities(status);
CREATE INDEX idx_communities_county ON communities(county);
CREATE INDEX idx_participants_community ON participants(community_id);
CREATE INDEX idx_participants_status ON participants(status);
```

### Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│         COMMUNITIES                 │
├─────────────────────────────────────┤
│ PK  id (UUID)                       │
│     name                            │
│     description                     │
│     county, town, lat, lng          │
│     coordinator_name/email/phone    │
│     min_participants                │
│     max_participants                │
│     status (enum)                   │
│     accepting_participants          │
│     total_potential_kwh             │
│     aggregate_cost_savings          │
│     bulk_discount_percentage        │
│     participant_count               │
│     created_at, updated_at          │
└─────────────────┬───────────────────┘
                  │
                  │ 1:N
                  │
                  ▼
┌─────────────────────────────────────┐
│         PARTICIPANTS                │
├─────────────────────────────────────┤
│ PK  id (UUID)                       │
│ FK  community_id → communities.id   │
│     name, email, phone              │
│     address, lat, lng               │
│     roof_area                       │
│     panel_count                     │
│     annual_production_kwh           │
│     installation_cost               │
│     annual_savings                  │
│     payback_years                   │
│     status (enum)                   │
│     joined_at                       │
│     solar_analyzed_at               │
└─────────────────────────────────────┘
```

---

## Deployment Architecture

### Production Environment (GCP Cloud Run)

```
┌────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                   │
│                   Project: bgn-ie-hack25dub-704            │
└────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  Cloud Run Service       │      │  Cloud Run Service       │
│  solarmatch-frontend     │      │  solarmatch-backend      │
├──────────────────────────┤      ├──────────────────────────┤
│ Region: europe-west1     │      │ Region: europe-west1     │
│ Memory: 1 GB             │      │ Memory: 2 GB             │
│ CPU: 1                   │      │ CPU: 2                   │
│ Min instances: 0         │      │ Min instances: 0         │
│ Max instances: 10        │      │ Max instances: 10        │
│ Timeout: 60s             │      │ Timeout: 300s            │
│ Port: 3000               │      │ Port: 8000               │
│                          │      │                          │
│ Image:                   │      │ Image:                   │
│ europe-west1-docker...   │      │ europe-west1-docker...   │
│ .../solarmatch-frontend  │      │ .../solarmatch-backend   │
└────────────┬─────────────┘      └───────────┬──────────────┘
             │                                 │
             │ HTTPS                           │ HTTPS
             ▼                                 ▼
   https://solarmatch-             https://solarmatch-
   frontend-xxx.run.app            backend-xxx.run.app
             │                                 │
             └─────────────┬───────────────────┘
                           │
                           │ Env Vars
                           ▼
              ┌────────────────────────┐
              │   Secret Manager       │
              ├────────────────────────┤
              │ google-solar-api-key   │
              │ database-url           │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Cloud SQL            │
              │   PostgreSQL 14        │
              ├────────────────────────┤
              │ Public IP:             │
              │ 34.105.148.120:5432   │
              │                        │
              │ Database:              │
              │ solarmatch-db          │
              └────────────────────────┘
```

### Container Images

```
Artifact Registry: europe-west1-docker.pkg.dev/bgn-ie-hack25dub-704/solarmatch/

├── solarmatch-backend:latest
│   └── Built from: backend/Dockerfile
│       - Base: python:3.11-slim
│       - Size: ~800 MB (with GDAL)
│       - Layers: GDAL libs, Python deps, app code
│
└── solarmatch-frontend:latest
    └── Built from: Dockerfile (root)
        - Base: node:20-alpine
        - Size: ~200 MB
        - Multi-stage: deps → builder → runner
```

### Environment Variables

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://solarmatch-backend-xxx.run.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Backend:**
```bash
# From Secret Manager
GOOGLE_SOLAR_API_KEY=<secret>
DATABASE_URL=postgresql://postgres:...@34.105.148.120:5432/solarmatch-db

# Direct env vars
DEBUG=False
ALLOWED_ORIGINS=https://solarmatch-frontend-xxx.run.app,http://localhost:3000
HOST=0.0.0.0
```

---

## Scalability & Performance

### Scaling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Auto-Scaling Policy                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Min Instances: 0  ──────────────►  Max Instances: 10      │
│                                                             │
│  Scale Up When:                                             │
│  • CPU > 60%                                                │
│  • Request queue > 10                                       │
│  • Concurrent requests > 80                                 │
│                                                             │
│  Scale Down When:                                           │
│  • CPU < 20% for 5 minutes                                  │
│  • No requests for 15 minutes → scale to 0                 │
│                                                             │
│  Cold Start:                                                │
│  • Frontend: ~2-3 seconds                                   │
│  • Backend: ~5-8 seconds (GDAL loading)                     │
└─────────────────────────────────────────────────────────────┘
```

### Performance Optimizations

**Frontend:**
- ✅ Next.js standalone output (smaller bundle)
- ✅ Static asset optimization
- ✅ Code splitting per route
- ✅ Image optimization (Next.js Image)
- ✅ Framer Motion lazy loading
- ✅ PDF generation on-demand

**Backend:**
- ✅ GeoTIFF caching (avoid re-downloading)
- ✅ Connection pooling (SQLAlchemy)
- ✅ Async HTTP requests (httpx)
- ✅ GeoTIFF processing in memory
- ✅ Database query optimization (indexes)
- ✅ Response compression (FastAPI)

### Current Limitations & Future Improvements

| Aspect | Current | Improvement Opportunity |
|--------|---------|-------------------------|
| **Cache** | Local disk | → Redis/Cloud Storage for shared cache |
| **Database** | Single instance | → Read replicas for scaling |
| **CDN** | None | → Cloud CDN for static assets |
| **Rate Limiting** | None | → Implement per-IP rate limits |
| **Monitoring** | Basic Cloud Run | → Custom metrics, APM |
| **Search** | Full table scan | → Geospatial indexes (PostGIS) |
| **PDF Generation** | Client-side | → Server-side rendering |

### Cost Estimates (Monthly)

```
Low Traffic (100 users/day):
├─ Frontend Cloud Run:     $5-10
├─ Backend Cloud Run:      $10-20
├─ Cloud SQL:              $10-30
├─ Artifact Registry:      $1
├─ Secret Manager:         $0.50
├─ Egress:                 $2-5
└─ Total:                  ~$29-66

Medium Traffic (1000 users/day):
├─ Frontend Cloud Run:     $20-40
├─ Backend Cloud Run:      $50-100
├─ Cloud SQL:              $30-80
├─ Artifact Registry:      $2
├─ Secret Manager:         $0.50
├─ Egress:                 $10-30
└─ Total:                  ~$113-253

High Traffic (10k users/day):
├─ Consider:
│  - Cloud CDN
│  - Redis cache
│  - Load balancer
│  - Database read replicas
└─ Estimated:              $500-1500
```

---

## Security Considerations

### Authentication & Authorization
- ❌ **Not Implemented** (MVP scope)
- 🔮 **Future**: OAuth 2.0, JWT tokens, user accounts

### Data Protection
- ✅ HTTPS enforced (Cloud Run default)
- ✅ API keys in Secret Manager
- ✅ Database password encrypted
- ✅ CORS configured
- ⚠️ No PII encryption at rest (future)

### API Security
- ✅ Input validation (Pydantic)
- ✅ SQL injection protection (ORM)
- ❌ No rate limiting (needed for prod)
- ❌ No API key auth (open access)

---

## Monitoring & Observability

### Cloud Run Metrics
- Request count, latency, error rate
- CPU/memory utilization
- Instance count, cold starts
- Container logs

### Custom Logging
```python
logger.info("Solar analysis completed", extra={
    "latitude": lat,
    "longitude": lng,
    "source": "google_solar",
    "duration_ms": 1234
})
```

### Health Checks
- Frontend: `GET /api/health`
- Backend: `GET /api/health`
- Database: Connection pool health

---

## Conclusion

SolarMatch is a modern, cloud-native application built with:
- ✅ **Microservices architecture** (frontend + backend separation)
- ✅ **Serverless deployment** (Cloud Run auto-scaling)
- ✅ **Intelligent data sourcing** (dual API strategy)
- ✅ **Community-driven features** (social solar planning)
- ✅ **Production-ready infrastructure** (CI/CD, secrets management)

**Ready for:**
- Deployment to production
- Horizontal scaling
- Feature iteration
- User onboarding

**Next Steps:**
1. Deploy to production ✅ (in progress)
2. Add user authentication
3. Implement rate limiting
4. Set up monitoring dashboards
5. Optimize caching strategy
6. Add payment integration for coordinators
