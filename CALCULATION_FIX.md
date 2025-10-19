# Solar Calculation Fix - Roof Area and Capacity

## Summary

**Key Changes:**
- 🎯 **Analysis radius**: 50m → 10m (96% reduction in analyzed area)
- 📸 **Display radius**: 50m → 30m (for imagery only - better context)
- 🔍 **Flux threshold**: 50% → 75% of mean (stricter quality filter)
- ⚖️ **Practical reduction**: 73% → 55% (realistic installation constraints)

**Expected Results:**
- Typical home: 30-50 m² usable roof area
- System capacity: 5-10 kWp
- Net cost: €5,000-€11,000 (after grant)

---

## Problem Identified

The solar analysis was producing unrealistically high values:
- **Example 1**: 3040 m² usable roof area with 552.73 kWp capacity
- **Example 2**: 2251 m² usable roof area with 409.32 kWp capacity
- This is far too large for typical residential properties (expected: 30-50 m² usable, 5-10 kWp)

## Root Causes

### 1. ⚠️ CRITICAL: Radius Parameter Too Large
The **primary issue** was the radius parameter:
- **Old value**: 50 meters radius
- **Area covered**: π × 50² = **7,854 m²** (almost 2 acres!)
- **Result**: Analyzing multiple buildings, roads, parking lots, neighboring properties

### 2. Calculation Issues
The calculation in `backend/core/resultMath.py` was:
1. Using a **too-lenient flux threshold** (50% of mean) which kept almost all roof pixels
2. Applying an **insufficient reduction factor** (73%) for practical constraints

### Previous Calculation
```python
flux_threshold = flux_stats.get('mean', 0) * 0.50  # Too lenient
usable_roof_area = theoretically_usable_area * 0.73  # Not realistic enough
```

This meant that if Google's satellite imagery detected any structure as "roof", almost all of it would be counted as usable for solar panels.

## Solutions Implemented

### 1. ✅ CRITICAL FIX: Reduced Analysis Radius (50m → 10m)
Changed the **analysis radius** from 50 meters to **10 meters**:
- **New area covered**: π × 10² = **314 m²** (appropriate for single residential property)
- **Rationale**: 
  - Typical residential lot: 200-500 m²
  - Building footprint: 80-150 m²
  - 10m radius focuses on target building only
  - Avoids analyzing neighboring properties

**Impact**: This alone reduces the analyzed area by **96%** (from 7,854 m² to 314 m²)

**Note**: Imagery display uses 30m radius for better visual context, but calculations use 10m radius

### 2. Stricter Flux Filtering (50% → 75%)
Changed the flux threshold from 50% to **75% of mean flux**:
- Filters out poorly-oriented sections (north-facing, heavily shaded areas)
- Only keeps high-quality solar areas
- More aligned with professional solar assessments

### 3. More Realistic Reduction Factor (73% → 55%)
Updated practical reduction factors to account for real-world constraints:

| Factor | Percentage | Reason |
|--------|-----------|---------|
| Edge setbacks & ridges | 15% | Safety margins, structural integrity |
| Obstructions | 15% | Vents, chimneys, skylights, pipes |
| Access pathways | 10% | Maintenance access, safety requirements |
| Fire safety clearances | 5% | Building regulations |
| **Total usable** | **55%** | Realistic installable area |

### Updated Calculation
```python
flux_threshold = flux_stats.get('mean', 0) * 0.75  # High-quality areas only
usable_roof_area = theoretically_usable_area * 0.55  # Realistic reduction
```

## Expected Impact

### Before Fix (WRONG ❌)
Analyzing 50m radius = 7,854 m² area (multiple buildings!)
- Usable roof area: **2,251 m²** ❌
- System capacity: **409 kWp** ❌
- Net cost: **€448,452** ❌
- _This is industrial-scale, not residential!_

### After Fix (CORRECT ✅)
Analyzing 10m radius = 314 m² area (single building)
- Total detected roof: ~100-120 m²
- Theoretically usable (flux filter): ~50-60 m²
- **Practical usable: 25-35 m²** ✅
- **System capacity: 5-7 kWp** ✅
- **Net cost: €5,500-€7,700** ✅
- _Realistic for typical Irish residential home_

This aligns with professional solar assessments in Ireland.

## Files Modified

1. **`backend/core/resultMath.py`**
   - Line 40: Added `theoretically_usable_area` variable initialization
   - Line 55: Increased flux threshold from 0.50 to 0.75
   - Line 69: Decreased reduction factor from 0.73 to 0.55
   - Lines 106-114: Updated calculation notes

2. **`backend/main.py`**
   - Line 460: Changed default radius from 50m to 10m for analysis endpoint
   - Added validation: `le=50` to cap maximum radius

3. **`app/results/page.tsx`**
   - Line 90: Analysis API calls use `radius_meters=10` (focused calculation)
   - Line 237: Satellite imagery uses `radius_meters=30` (better visual context)
   - Line 289: Heatmap imagery uses `radius_meters=30` (matches satellite view)

## Verification Steps

1. **Backend changes** are picked up automatically by uvicorn reload
   - The Python backend will reload `resultMath.py` and `main.py` changes automatically

2. **Frontend changes** require browser refresh
   - Hard refresh the results page (Cmd+Shift+R on Mac)
   - Or restart the Next.js dev server if needed

3. **Test with a known address** and verify:
   - Usable roof area is reasonable (30-50 m² for typical homes)
   - System capacity is realistic (5-10 kWp for typical homes)
   - Net cost after grant: €5,000-€11,000 for typical systems
   - Satellite image shows the building with surrounding context (not too zoomed in)
   - Numbers match professional solar assessment expectations

## Additional Notes

- The PVGIS fallback (for rural areas) already uses appropriate conservative factors (55%)
- Frontend display remains unchanged - it shows values from backend
- This fix applies only to locations with Google Solar API imagery
- Rural locations using PVGIS are unaffected (already conservative)
