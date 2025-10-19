# PDF Financial Report Generator

This feature allows users to download a professional PDF report of their solar analysis results directly from the results page.

## Features

The PDF report includes:

### Page 1 - Financial Overview
- **Header**: SolarMatch branding with orange gradient
- **Property Address**: The analyzed location
- **Solar Suitability Score**: Large percentage display with color-coded rating
  - Green (≥80%): Excellent solar potential
  - Yellow (60-79%): Good solar potential
  - Red (<60%): Fair/Poor solar potential
- **Financial Overview Grid**:
  - 💰 Installation Cost (€)
  - 📈 Annual Savings (€)
  - ⏱️ Payback Period (years)
  - 🌱 CO₂ Reduction (kg/year)
- **System Specifications**:
  - Usable Roof Area (m²)
  - System Capacity (kWp)
  - Data Source (Google Solar API or PVGIS)

### Page 2 - Visual Analysis
- **Satellite View**: High-resolution satellite imagery of the property
- **Solar Flux Heatmap**: Color-coded visualization showing solar potential distribution

### Page 3 - Additional Information
- **Important Information**: Disclaimers and considerations
- **Custom Notes**: For rural areas or special cases
- **Footer**: Generation date and website reference

## Usage

### For Users
1. Navigate to the results page after analyzing an address
2. Wait for the analysis to complete (green "Analysis Complete" badge)
3. Click the **"Download PDF Report"** button in the top-right corner
4. The PDF will be automatically downloaded with a filename based on the address

### For Developers

#### Import the Generator
```typescript
import { generateSolarPDF, downloadPDF, openPDFInNewTab } from '@/lib/pdfGenerator'
```

#### Generate and Download PDF
```typescript
const handleGeneratePDF = async () => {
  const pdf = await generateSolarPDF(
    results,                      // Solar analysis data
    satelliteImageUrl,            // Optional: satellite image blob URL
    heatmapImageUrl              // Optional: heatmap image blob URL
  )
  
  downloadPDF(pdf, 'custom-filename.pdf')
}
```

#### Open PDF in New Tab (Alternative)
```typescript
const pdf = await generateSolarPDF(results, imageUrl, heatmapUrl)
openPDFInNewTab(pdf) // Opens in browser instead of downloading
```

## Data Structure

The `generateSolarPDF` function expects a `SolarResults` object:

```typescript
interface SolarResults {
  address: string              // Property address
  solarSuitability: number     // 0-100 percentage score
  suitabilityText: string      // "Excellent/Good/Fair/Poor solar potential"
  installationCost: number     // In euros (€)
  paybackPeriod: number        // In years
  annualSavings: number        // In euros (€)
  co2Reduction: number         // In kg/year
  usableSpace: number          // Roof area in m²
  capacity: number             // System capacity in kWp
  dataSource: string           // "Google Solar API" or "PVGIS"
  note?: string                // Optional notes (e.g., for rural areas)
}
```

## Dependencies

- **jsPDF**: PDF document generation
- **@types/jspdf**: TypeScript type definitions

Install with:
```bash
npm install jspdf
npm install --save-dev @types/jspdf
```

## Customization

### Modify Colors
Edit the color values in `pdfGenerator.ts`:
```typescript
pdf.setFillColor(255, 153, 51) // Orange header
pdf.setTextColor(255, 255, 255) // White text
```

### Change Layout
Adjust the `yPosition` variable and spacing values to reorganize content:
```typescript
yPosition += 10 // Add spacing
```

### Add Custom Sections
Add new sections before `return pdf`:
```typescript
pdf.addPage()
pdf.setFontSize(14)
pdf.text('Custom Section', margin, yPosition)
```

## Troubleshooting

### Images Not Appearing in PDF
- Ensure image URLs are accessible (blob URLs or data URLs work best)
- Check CORS settings if loading external images
- Verify images are loaded before calling `generateSolarPDF`

### PDF Quality Issues
- Adjust image dimensions in the backend API calls (`max_width`, `max_height`)
- Use higher quality images for better results
- Consider reducing image size if file size is too large

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- PDF generation is client-side (no server required)
- Large files may take longer on slower devices

## Future Enhancements

Potential improvements:
- [ ] Add charts and graphs for energy production
- [ ] Include monthly breakdown of savings
- [ ] Add comparison with neighboring properties
- [ ] Multi-language support
- [ ] Custom branding options
- [ ] Email delivery option
- [ ] Cloud storage integration

## License

Part of the SolarMatch project.
