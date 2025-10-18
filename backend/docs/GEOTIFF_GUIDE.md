# GeoTIFF Processing Features - Complete Guide

## 🎉 What's New

We've added comprehensive GeoTIFF processing capabilities to the Solar API backend! You can now:

1. **Download** GeoTIFF files from Google Solar API
2. **Process** and convert them to PNG images
3. **Generate** beautiful visualizations (heatmaps, elevation maps)
4. **Extract** statistics and metadata
5. **Cache** files for faster subsequent requests

## 📊 Test Results

Successfully processed GeoTIFF files for Google HQ:
- ✅ RGB Imagery: 2.6MB → 2.1MB PNG
- ✅ Solar Flux: 1.5MB → 704KB heatmap PNG
- ✅ Elevation: 1.4MB → 311KB heightmap PNG
- ✅ Roof Mask: 3.6KB → 3.6KB mask PNG
- ✅ Cache: 5.32MB total

### Statistics Extracted:
- **Solar Flux**: 238-1975 kWh/kW/year (mean: 1320)
- **Elevation**: 1.12-23.81 meters (building height: 22.69m)
- **Image Size**: 996x1000 pixels
- **Resolution**: 0.1m per pixel

## 🚀 API Endpoints

### 1. RGB Aerial Imagery
```
GET /api/solar/rgb-image?latitude=37.4221&longitude=-122.0841
```
Returns: PNG image of the roof from satellite/aerial view

**Use Cases:**
- Show users what their roof looks like
- Display in map overlays
- Base layer for panel placement visualization

### 2. Solar Flux Heatmap
```
GET /api/solar/annual-flux-heatmap?latitude=37.4221&longitude=-122.0841&colormap=plasma
```
Returns: Colored heatmap showing solar potential

**Colormaps Available:**
- `hot` - Red/yellow gradient (default)
- `viridis` - Blue to yellow
- `plasma` - Purple to yellow
- `inferno` - Black to yellow
- `magma` - Black to white

**Use Cases:**
- Visualize best spots for solar panels
- Show annual solar irradiance
- Interactive roof analysis tools

### 3. Elevation Map
```
GET /api/solar/elevation-map?latitude=37.4221&longitude=-122.0841
```
Returns: Colored heightmap showing building structure

**Use Cases:**
- 3D roof visualization
- Understanding roof pitch and structure
- Identifying obstructions (chimneys, vents)

### 4. Roof Mask
```
GET /api/solar/roof-mask?latitude=37.4221&longitude=-122.0841
```
Returns: Binary mask showing roof boundaries

**Use Cases:**
- Precise roof boundary detection
- Panel placement calculations
- Area measurements

### 5. Flux Statistics (JSON)
```
GET /api/solar/flux-statistics?latitude=37.4221&longitude=-122.0841
```
Returns: Statistical analysis of solar potential

**Response Example:**
```json
{
  "location": {"latitude": 37.4221, "longitude": -122.0841},
  "radius_meters": 50.0,
  "statistics": {
    "min": 238.0,
    "max": 1975.0,
    "mean": 1319.73,
    "median": 1446.0,
    "std": 429.97,
    "count": 996000
  },
  "metadata": {
    "width": 996,
    "height": 1000,
    "resolution": [0.1, 0.1],
    "bounds": {...}
  }
}
```

### 6. GeoTIFF Metadata (JSON)
```
GET /api/solar/geotiff-metadata?latitude=37.4221&longitude=-122.0841&layer_type=dsm
```
Returns: Technical metadata about the GeoTIFF file

**Layer Types:**
- `rgb` - RGB imagery
- `dsm` - Digital Surface Model
- `mask` - Roof mask
- `flux` - Solar flux

### 7. Cache Management
```
GET /api/solar/cache-info      # Get cache size
DELETE /api/solar/cache         # Clear cache
```

## 💻 Frontend Integration Examples

### React Component - Display RGB Image
```tsx
'use client';

export function RoofImage({ latitude, longitude }: Props) {
  const imageUrl = `http://localhost:8000/api/solar/rgb-image?latitude=${latitude}&longitude=${longitude}`;
  
  return (
    <div className="roof-viewer">
      <img 
        src={imageUrl} 
        alt="Roof aerial view"
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );
}
```

### React Component - Display Solar Heatmap
```tsx
'use client';

import { useState } from 'react';

export function SolarHeatmap({ latitude, longitude }: Props) {
  const [colormap, setColormap] = useState('hot');
  const imageUrl = `http://localhost:8000/api/solar/annual-flux-heatmap?latitude=${latitude}&longitude=${longitude}&colormap=${colormap}`;
  
  return (
    <div className="heatmap-viewer">
      <div className="controls">
        <label>Color Theme:</label>
        <select value={colormap} onChange={(e) => setColormap(e.target.value)}>
          <option value="hot">Hot (Red/Yellow)</option>
          <option value="viridis">Viridis (Blue/Yellow)</option>
          <option value="plasma">Plasma (Purple/Yellow)</option>
          <option value="inferno">Inferno (Dark/Bright)</option>
          <option value="magma">Magma (Dark/Light)</option>
        </select>
      </div>
      <img 
        src={imageUrl} 
        alt="Solar flux heatmap"
        className="w-full h-auto"
      />
    </div>
  );
}
```

### React Component - Fetch and Display Statistics
```tsx
'use client';

import { useEffect, useState } from 'react';

export function SolarStats({ latitude, longitude }: Props) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`http://localhost:8000/api/solar/flux-statistics?latitude=${latitude}&longitude=${longitude}`)
      .then(res => res.json())
      .then(data => {
        setStats(data.statistics);
        setLoading(false);
      });
  }, [latitude, longitude]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="stats-grid">
      <div className="stat">
        <label>Average Solar Potential</label>
        <value>{stats.mean.toFixed(0)} kWh/kW/year</value>
      </div>
      <div className="stat">
        <label>Peak Solar Potential</label>
        <value>{stats.max.toFixed(0)} kWh/kW/year</value>
      </div>
      <div className="stat">
        <label>Minimum Solar Potential</label>
        <value>{stats.min.toFixed(0)} kWh/kW/year</value>
      </div>
    </div>
  );
}
```

### Combined Viewer - Overlay Multiple Layers
```tsx
'use client';

export function RoofAnalyzer({ latitude, longitude }: Props) {
  const [layer, setLayer] = useState('rgb');
  
  const getImageUrl = () => {
    const base = 'http://localhost:8000/api/solar';
    const params = `latitude=${latitude}&longitude=${longitude}`;
    
    switch(layer) {
      case 'rgb':
        return `${base}/rgb-image?${params}`;
      case 'heatmap':
        return `${base}/annual-flux-heatmap?${params}&colormap=plasma`;
      case 'elevation':
        return `${base}/elevation-map?${params}`;
      case 'mask':
        return `${base}/roof-mask?${params}`;
      default:
        return `${base}/rgb-image?${params}`;
    }
  };
  
  return (
    <div className="roof-analyzer">
      <div className="layer-selector">
        <button onClick={() => setLayer('rgb')}>Aerial View</button>
        <button onClick={() => setLayer('heatmap')}>Solar Heatmap</button>
        <button onClick={() => setLayer('elevation')}>Elevation</button>
        <button onClick={() => setLayer('mask')}>Roof Mask</button>
      </div>
      <img src={getImageUrl()} alt={`Roof ${layer}`} />
    </div>
  );
}
```

## 🛠️ Backend Implementation Details

### Technologies Used:
- **rasterio**: GeoTIFF reading and processing
- **numpy**: Array manipulation and statistics
- **Pillow**: Image conversion and manipulation
- **matplotlib**: Heatmap and visualization generation

### Caching Strategy:
- Files cached in `/tmp/solar_geotiff_cache`
- Cache key: `{type}_{latitude}_{longitude}_{radius}`
- Example: `rgb_37.422094_-122.084090_50.0.tif`
- Cache persists between requests
- Can be cleared via API endpoint

### Performance:
- **First request**: Downloads from Google (~1-3 seconds)
- **Cached requests**: Instant (<100ms)
- **PNG conversion**: Fast (~200-500ms)
- **Memory efficient**: Streams data, doesn't load all in memory

## 📁 Test Output Files

Run the test to generate sample files:
```bash
cd backend
source venv/bin/activate
python test_geotiff.py
```

This creates `output/` directory with:
- `rgb_imagery.png` - Aerial photo
- `solar_flux_heatmap.png` - Solar potential (hot colormap)
- `elevation_map.png` - Building elevation
- `roof_mask.png` - Roof boundaries
- `flux_heatmap_*.png` - Multiple colormap variations

## 🎨 Creative Use Cases

1. **Solar Potential Explorer**
   - Overlay heatmap on RGB imagery with transparency
   - Show "hot spots" for panel placement
   - Interactive cursor showing solar potential at that point

2. **3D Roof Visualization**
   - Use DSM (elevation) data to create 3D models
   - Combine with RGB for textured 3D view
   - Show panel placement in 3D

3. **Time-based Analysis**
   - Use hourly shade data (12 GeoTIFFs)
   - Animate shade patterns throughout the day
   - Show best times for solar generation

4. **Comparative Analysis**
   - Compare multiple properties side-by-side
   - Generate reports with all visualizations
   - Rank properties by solar potential

5. **AR/VR Integration**
   - Use elevation and mask data for AR overlays
   - Real-time panel placement preview
   - Virtual roof inspection

## 🚦 Getting Started

1. **Start the server:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

2. **Test an endpoint:**
```bash
curl "http://localhost:8000/api/solar/rgb-image?latitude=37.4221&longitude=-122.0841" -o roof.png
```

3. **View interactive docs:**
```
http://localhost:8000/docs
```

4. **Try in your browser:**
```
http://localhost:8000/api/solar/annual-flux-heatmap?latitude=37.4221&longitude=-122.0841
```

## 📝 Notes

- All PNG endpoints return images directly (use `<img src="...">`)
- JSON endpoints return structured data
- Coordinates must have data in Google Solar API
- Cache automatically manages disk space
- API key required (configured in `.env`)

## 🔮 Future Enhancements

Potential additions:
- [ ] Monthly flux animations
- [ ] Hourly shade animations
- [ ] Panel placement optimization
- [ ] ROI heatmaps
- [ ] Comparison overlays
- [ ] WebP format support
- [ ] Configurable cache size limits
- [ ] Batch processing for multiple locations

---

✨ **You now have full GeoTIFF processing capabilities!** ✨
