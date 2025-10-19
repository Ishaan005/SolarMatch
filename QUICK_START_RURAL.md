# 🚀 Quick Start: Testing Rural Ireland Support

## What's New?
SolarMatch now supports **all of Ireland** - both urban areas with satellite imagery AND rural areas using PVGIS climate data!

---

## Test It Right Now

### 1. Start the Backend
```bash
cd backend
uvicorn main:app --reload
```

### 2. Run Test Script (Optional)
```bash
python test_pvgis.py
```

This will test:
- ✅ PVGIS client
- ✅ Urban location (Dublin - uses Google Solar API)
- ✅ Rural location (Donegal - uses PVGIS)
- ✅ Coverage checker

### 3. Start the Frontend
```bash
cd ..
npm run dev
```

Visit: `http://localhost:3000`

---

## Test These Addresses

### Urban (Google Solar API with Imagery)
Try these to see **satellite imagery** + **heatmaps**:

1. **Dublin City Centre**
   - "Grafton Street, Dublin"
   - "Trinity College Dublin"
   - "O'Connell Street, Dublin"

2. **Cork**
   - "Patrick Street, Cork"
   
3. **Galway**
   - "Shop Street, Galway City"

**Expected:** 🛰️ High-res imagery, toggle between satellite/heatmap

---

### Rural (PVGIS Fallback)
Try these to see **modeled data** approach:

1. **Connemara, Galway**
   - "Clifden, Connemara"
   - "Letterfrack, County Galway"

2. **Rural Donegal**
   - "Glencolmcille, Donegal"
   - "Dunfanaghy, County Donegal"

3. **Rural Kerry**
   - "Dingle, County Kerry"
   - "Cahersiveen, Kerry"

4. **Wicklow Mountains**
   - "Glendalough, Wicklow"

**Expected:** 📊 Modeled data badge, informative banner, no imagery toggle

---

## What You'll See

### Urban Areas
```
Status: ✅ Analysis Complete | 🛰️ High-Res Imagery
        
[Satellite View | Heat Map]  ← Toggle buttons
    
    🌍 Actual satellite photo
    or
    🔥 Solar flux heatmap
    
Financial Overview:
    €14,400 installation
    9.2 years payback
    etc.
```

### Rural Areas
```
Status: ✅ Analysis Complete | 📊 Modeled Data

⚠️ Rural Area Analysis
   Location not covered by Google Solar API imagery.
   Analysis based on PVGIS satellite-derived solar radiation data.
   💡 Tip: Consider a professional site survey for accurate roof measurements.

[No toggle - shows info card instead]

    📊 No Satellite Imagery Available
        
        This rural location isn't covered by high-resolution
        imagery yet. Solar analysis based on regional data.
        
        💡 What this means:
        • Solar potential estimates are reliable
        • Based on satellite weather data  
        • Consider a site survey for details
        
Financial Overview:
    €14,400 installation
    9.2 years payback
    etc.
```

---

## API Testing

### Check Coverage
```bash
# Urban Dublin (should have imagery)
curl "http://localhost:8000/api/solar/coverage?latitude=53.3498&longitude=-6.2603"

# Rural Connemara (should use PVGIS)
curl "http://localhost:8000/api/solar/coverage?latitude=53.5461&longitude=-9.8902"
```

### Get Analysis
```bash
# Rural location with estimated roof area
curl "http://localhost:8000/api/solar/analysis?latitude=53.5461&longitude=-9.8902&estimated_roof_area=120"

# Urban location (roof area calculated from imagery)
curl "http://localhost:8000/api/solar/analysis?latitude=53.3498&longitude=-6.2603&radius_meters=50"
```

---

## Expected Behavior

### Urban Location
```json
{
  "data_source": "Google Solar API",
  "has_imagery": true,
  "imagery_quality": "MEDIUM",
  "flux_stats": { "mean": 1250, ... },
  "estimated_roof_area_sq_meters": 125.4,
  "imagery_urls": { "rgb": "...", "mask": "..." }
}
```

### Rural Location
```json
{
  "data_source": "PVGIS",
  "has_imagery": false,
  "coverage_type": "modeled",
  "note": "Location not covered by Google Solar API imagery...",
  "flux_stats": { "mean": 1180, ... },
  "estimated_roof_area_sq_meters": 120.0,
  "optimal_panel_config": {
    "tilt_angle": 35,
    "azimuth": 0
  }
}
```

---

## Common Issues

### ❌ Backend Error: Module Not Found
```bash
# Missing httpx - install it
pip install httpx
```

### ❌ Frontend: Images Not Loading
- Check backend is running on `http://localhost:8000`
- Rural areas won't have images (expected behavior)
- Check browser console for errors

### ❌ PVGIS Timeout
- Check internet connection
- PVGIS service might be temporarily down
- Wait a moment and try again

---

## Key Files Changed

### Backend
- ✅ `backend/core/pvgis_client.py` - NEW: PVGIS API client
- ✅ `backend/core/unified_solar_service.py` - NEW: Smart coordinator
- ✅ `backend/main.py` - Updated: Uses unified service
- ✅ `backend/test_pvgis.py` - NEW: Test suite

### Frontend
- ✅ `app/results/page.tsx` - Updated: Handles both data sources
  - New state: `dataSource`, `hasImagery`, `note`
  - Rural area banner
  - Smart image display
  - Data source badges

### Documentation
- ✅ `SOLAR_DATA_SOURCES.md` - Data source comparison
- ✅ `RURAL_IRELAND_IMPLEMENTATION.md` - Implementation details
- ✅ `QUICK_START_RURAL.md` - This file!

---

## Success Criteria ✅

You know it's working when:

1. ✅ Urban addresses show satellite imagery
2. ✅ Rural addresses show informative placeholder
3. ✅ Both return solar suitability scores
4. ✅ Both calculate financial estimates  
5. ✅ Data source is clearly indicated
6. ✅ No errors in console
7. ✅ Professional UX for both scenarios

---

## Next Steps

Once confirmed working:

1. **Test more locations** across Ireland
2. **Gather user feedback** on rural UX
3. **Refine roof area estimates** based on Irish home data
4. **Consider Eircode integration** for typical home sizes
5. **Add manual roof area input** to analyze page

---

## Need Help?

Check these files:
- `RURAL_IRELAND_IMPLEMENTATION.md` - Full technical details
- `SOLAR_DATA_SOURCES.md` - Data source documentation
- `backend/test_pvgis.py` - Working test examples

---

**Happy Testing! 🎉**

Your SolarMatch app now covers all of Ireland! 🇮🇪☀️
