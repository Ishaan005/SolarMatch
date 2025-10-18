# Google Solar API Response Guide

## Quick Reference

The Google Solar API returns incredibly detailed solar potential data for any building. Here's what you get:

## 📊 Main Data Structure

```typescript
{
  // Building identification
  name: string                    // Unique building ID
  center: {latitude, longitude}   // Building center coordinates
  boundingBox: {sw, ne}          // Geographic bounds
  
  // Imagery metadata
  imageryDate: {year, month, day}
  imageryQuality: "LOW" | "MEDIUM" | "HIGH"
  imageryProcessedDate: {year, month, day}
  
  // The main payload
  solarPotential: {
    // Overview metrics
    maxArrayPanelsCount: number           // Max panels that fit
    maxArrayAreaMeters2: number           // Total usable roof area (m²)
    maxSunshineHoursPerYear: number       // Annual sunshine hours
    
    // Panel configurations (375 different size options!)
    solarPanelConfigs: [
      {
        panelsCount: number
        yearlyEnergyDcKwh: number
        roofSegmentSummaries: [...]
      }
    ],
    
    // Financial projections for different electricity bills
    financialAnalyses: [
      {
        monthlyBill: {currencyCode, units}
        panelConfigIndex: number
        
        financialDetails: {
          initialAcKwhPerYear: number
          remainingLifetimeUtilityBill: Money
          federalIncentive: Money
          solarPercentage: number           // % of energy needs covered
          percentageExportedToGrid: number  // % sold back to grid
        }
        
        // Three purchase options
        cashPurchaseSavings: {
          outOfPocketCost: Money
          upfrontCost: Money
          rebateValue: Money
          paybackYears: number
          savings: {
            savingsYear1: Money
            savingsYear20: Money
            financiallyViable: boolean
          }
        },
        
        financedPurchaseSavings: {...},  // Loan option
        leasingSavings: {...}             // Lease option
      }
    ],
    
    // Individual panel placement (2,283 panels mapped!)
    solarPanels: [
      {
        center: {latitude, longitude}
        orientation: "LANDSCAPE" | "PORTRAIT"
        yearlyEnergyDcKwh: number
        segmentIndex: number
      }
    ],
    
    // Roof analysis (129 segments!)
    roofSegmentStats: [
      {
        pitchDegrees: number       // Roof slope
        azimuthDegrees: number     // Compass direction (180° = South)
        planeHeightAtCenterMeters: number
        boundingBox: {sw, ne}
        stats: {
          areaMeters2: number
          sunshineQuantiles: number[]
        }
      }
    ],
    
    // Panel specifications
    panelCapacityWatts: number     // e.g., 400W
    panelHeightMeters: number      // e.g., 1.879m
    panelWidthMeters: number       // e.g., 1.045m
    panelLifetimeYears: number     // e.g., 20-25 years
  },
  
  // Building statistics
  buildingStats: {
    areaMeters2: number
    sunshineQuantiles: number[]    // 11 values: 0-10%, 10-20%, ..., 90-100%
    groundAreaMeters2: number
  }
}
```

## 🎯 Most Useful Fields for Common Use Cases

### Solar Potential Display
```typescript
const potential = response.solarPotential;
const maxPanels = potential.maxArrayPanelsCount;           // e.g., 2,283
const annualEnergy = potential.maxSunshineHoursPerYear;    // e.g., 1,847.9 hours
const roofArea = potential.maxArrayAreaMeters2;            // e.g., 4,482.80 m²
```

### Financial Calculator
```typescript
// Find analysis for user's monthly bill (e.g., $200/month)
const analysis = response.solarPotential.financialAnalyses.find(
  a => a.monthlyBill.units === "200"
);

const savings = analysis.cashPurchaseSavings;
console.log(`Upfront cost: $${savings.upfrontCost.units}`);
console.log(`After rebates: $${savings.outOfPocketCost.units}`);
console.log(`Payback period: ${savings.paybackYears} years`);
console.log(`20-year savings: $${savings.savings.savingsYear20.units}`);
```

### Solar Coverage
```typescript
const financialDetails = analysis.financialDetails;
const coverage = financialDetails.solarPercentage;      // e.g., 98.3%
const exportedToGrid = financialDetails.percentageExportedToGrid;  // e.g., 52.1%
const federalCredit = financialDetails.federalIncentive.units;  // e.g., $9,125
```

### Panel Visualization
```typescript
// Get all individual panel placements
const panels = response.solarPotential.solarPanels;
panels.forEach(panel => {
  const {latitude, longitude} = panel.center;
  const energy = panel.yearlyEnergyDcKwh;
  const orientation = panel.orientation;
  // Plot on map...
});
```

### Roof Analysis
```typescript
const segments = response.solarPotential.roofSegmentStats;
segments.forEach((segment, i) => {
  const pitch = segment.pitchDegrees;
  const azimuth = segment.azimuthDegrees;
  const area = segment.stats.areaMeters2;
  
  // South-facing (180°) with moderate pitch is ideal
  const isSouthFacing = azimuth >= 135 && azimuth <= 225;
  const isGoodPitch = pitch >= 15 && pitch <= 40;
  const quality = isSouthFacing && isGoodPitch ? "Excellent" : "OK";
});
```

## 💰 Financial Data Breakdown

The API provides **23 different financial scenarios** based on monthly electricity bills:
- From $50/month to $500/month
- Each with 3 purchase options (cash, financed, lease)
- Includes 20-year projections and payback periods

### Example: $200/month Bill
```typescript
{
  monthlyBill: { currencyCode: "USD", units: "200" },
  solarPercentage: 98.3,              // Covers 98.3% of needs
  percentageExportedToGrid: 52.1,     // Sell back 52.1%
  federalIncentive: { units: "9125" },
  
  cashPurchaseSavings: {
    upfrontCost: { units: "21293" },
    outOfPocketCost: { units: "30418" },  // After rebates
    paybackYears: 10.5,
    savings: {
      savingsYear1: { units: "1857" },
      savingsYear20: { units: "44194" },
      financiallyViable: true
    }
  }
}
```

## 🏠 Roof Complexity Example (Google HQ)

**Real data from the API:**
- **129 roof segments** analyzed
- **2,283 individual panels** mapped
- **375 different configurations** available
- Segments range from 9 m² to 536 m²
- Each segment has its own pitch, azimuth, and sun exposure

## 🌍 Geographic Coverage

The API works for locations where Google has high-quality aerial imagery. If data isn't available, you'll get a 404 error:

```json
{
  "error": {
    "code": 404,
    "message": "Requested entity was not found.",
    "status": "NOT_FOUND"
  }
}
```

## 📝 Quality Levels

You can request specific imagery quality:
- `LOW`: Basic analysis
- `MEDIUM`: Good detail
- `HIGH`: Maximum accuracy

Most locations return `HIGH` quality data when available.

## 🔑 Key Metrics Explained

### Energy Production
- **DC (Direct Current)**: What panels generate
- **AC (Alternating Current)**: What you actually use (slightly less due to inverter losses)
- API provides both: `yearlyEnergyDcKwh` for panels, `initialAcKwhPerYear` for usable energy

### Azimuth (Compass Direction)
- 0° = North
- 90° = East
- 180° = South (ideal in Northern Hemisphere)
- 270° = West

### Pitch (Roof Angle)
- 0° = Flat roof
- 15-40° = Optimal for most locations
- 45°+ = Very steep

## 🚀 Using This Data

### Frontend Display Ideas
1. **Hero stats**: "Your roof can fit 2,283 panels and save $44,194 over 20 years"
2. **Interactive map**: Show exact panel placement on satellite imagery
3. **ROI calculator**: User enters their bill, see personalized projections
4. **Comparison tool**: Show 3-5 different installation sizes side-by-side
5. **Environmental impact**: Calculate CO2 offset, trees equivalent

### Backend Processing
1. Cache responses by location (they don't change often)
2. Pre-calculate common metrics for faster display
3. Store user preferences (bill amount) for personalized results
4. Generate comparison reports

## 📚 Additional Resources

- Full API Docs: https://developers.google.com/maps/documentation/solar
- Test the API: Run `python quick_test.py` in backend/
- Detailed explanation: Run `python explain_api.py` in backend/
- Interactive docs: http://localhost:8000/docs (when server is running)
