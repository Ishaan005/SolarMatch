import { jsPDF } from 'jspdf'

interface SolarResults {
  address: string
  solarSuitability: number
  suitabilityText: string
  installationCost: number
  paybackPeriod: number
  annualSavings: number
  co2Reduction: number
  usableSpace: number
  capacity: number
  dataSource: string
  note?: string
  // Optional additional details
  annualEnergy?: number
  lifetimeSavings?: number
  monthlyPayment?: number
}

export async function generateSolarPDF(results: SolarResults, satelliteImageUrl?: string, heatmapImageUrl?: string) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (2 * margin)
  
  let yPosition = margin

  // Header with Logo
  pdf.setFillColor(255, 153, 51) // Orange
  pdf.rect(0, 0, pageWidth, 40, 'F')
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(28)
  pdf.setFont('helvetica', 'bold')
  pdf.text('SolarMatch', margin, 20)
  
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Solar Financial Report', margin, 30)
  
  yPosition = 50

  // Property Address
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Property Address:', margin, yPosition)
  pdf.setFont('helvetica', 'normal')
  const addressLines = pdf.splitTextToSize(results.address, contentWidth - 45)
  pdf.text(addressLines, margin + 45, yPosition)
  yPosition += (addressLines.length * 6) + 10

  // Solar Suitability Score Section
  pdf.setFillColor(249, 250, 251)
  pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F')
  
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Solar Suitability Score', margin + 5, yPosition + 10)
  
  // Suitability percentage
  const scoreColor = results.solarSuitability >= 80 ? [34, 197, 94] : 
                     results.solarSuitability >= 60 ? [251, 191, 36] : [239, 68, 68]
  pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
  pdf.setFontSize(32)
  pdf.text(`${results.solarSuitability}%`, pageWidth - margin - 30, yPosition + 18)
  
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(results.suitabilityText, margin + 5, yPosition + 22)
  
  yPosition += 40

  // Financial Overview Section
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Financial Overview', margin, yPosition)
  yPosition += 8

  // Financial grid - without emojis
  const financialData = [
    { label: 'Installation Cost', value: `EUR ${results.installationCost.toLocaleString()}` },
    { label: 'Annual Savings', value: `EUR ${results.annualSavings.toLocaleString()}` },
    { label: 'Payback Period', value: `${results.paybackPeriod} years` },
    { label: 'CO2 Reduction', value: `${results.co2Reduction.toLocaleString()} kg/year` }
  ]

  const boxHeight = 22
  const boxGap = 5
  
  financialData.forEach((item, index) => {
    const row = Math.floor(index / 2)
    const col = index % 2
    const boxWidth = (contentWidth - boxGap) / 2
    const xPos = margin + (col * (boxWidth + boxGap))
    const yPos = yPosition + (row * (boxHeight + boxGap))
    
    // Box background
    pdf.setFillColor(255, 255, 255)
    pdf.setDrawColor(229, 231, 235)
    pdf.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'FD')
    
    // Label
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(107, 114, 128)
    pdf.text(item.label, xPos + 5, yPos + 8)
    
    // Value
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(item.value, xPos + 5, yPos + 16)
  })
  
  yPosition += (Math.ceil(financialData.length / 2) * (boxHeight + boxGap)) + 10

  // Detailed Financial Breakdown Section
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text('Financial Breakdown', margin, yPosition)
  yPosition += 8

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(60, 60, 60)

  // Calculate additional metrics
  const costPerKw = (results.installationCost / results.capacity).toFixed(0)
  const totalLifetimeSavings = (results.annualSavings * 25).toFixed(0) // 25 year lifespan
  const roi = ((parseInt(totalLifetimeSavings) - results.installationCost) / results.installationCost * 100).toFixed(1)
  const monthlyPayment = (results.installationCost / (results.paybackPeriod * 12)).toFixed(0)

  const breakdown = [
    `Installation Cost Breakdown: EUR ${costPerKw} per kWp (industry standard: EUR 1,000-1,500/kWp)`,
    `Annual Energy Production: Approximately ${(results.capacity * 1000).toFixed(0)} kWh per year`,
    `Electricity Rate Assumed: EUR 0.30 per kWh (average European rate)`,
    `System Lifespan: 25-30 years with proper maintenance`,
    `25-Year Lifetime Savings: EUR ${parseInt(totalLifetimeSavings).toLocaleString()}`,
    `Return on Investment (ROI): ${roi}% over 25 years`,
    `Monthly Payment (if financed): EUR ${monthlyPayment} over ${results.paybackPeriod} years`,
  ]

  breakdown.forEach((line) => {
    const lines = pdf.splitTextToSize(line, contentWidth)
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * 5
  })

  yPosition += 5

  // System Specifications
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text('System Specifications', margin, yPosition)
  yPosition += 8

  const specs = [
    { label: 'Usable Roof Area', value: `${results.usableSpace.toFixed(1)} sq meters (~${(results.usableSpace * 10.764).toFixed(0)} sq ft)` },
    { label: 'System Capacity', value: `${results.capacity.toFixed(2)} kWp (kilowatt-peak)` },
    { label: 'Estimated Panels', value: `${Math.ceil(results.capacity / 0.4)} panels (assuming 400W panels)` },
    { label: 'Panel Type Recommended', value: 'Monocrystalline (highest efficiency)' },
    { label: 'Data Source', value: results.dataSource },
    { label: 'Analysis Date', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
  ]

  pdf.setFontSize(9)
  specs.forEach((spec) => {
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(`${spec.label}:`, margin, yPosition)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    const valueLines = pdf.splitTextToSize(spec.value, contentWidth - 60)
    pdf.text(valueLines, margin + 60, yPosition)
    yPosition += valueLines.length * 5
  })

  // Add new page for images if available
  if (satelliteImageUrl || heatmapImageUrl) {
    pdf.addPage()
    yPosition = margin

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Visual Analysis', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    pdf.text('High-resolution satellite imagery and solar potential analysis of your property.', margin, yPosition)
    yPosition += 8

    try {
      // Calculate image dimensions
      const imgWidth = contentWidth
      const imgHeight = (imgWidth * 3) / 4 // Maintain aspect ratio
      const maxHeightForImage = (pageHeight - margin * 2 - 40) / 2 // Space for 2 images on one page

      // Add satellite image
      if (satelliteImageUrl) {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        pdf.text('1. Satellite View', margin, yPosition)
        yPosition += 4

        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(80, 80, 80)
        pdf.text('Aerial view of your property showing roof structure and orientation.', margin, yPosition)
        yPosition += 5

        const actualImgHeight = Math.min(imgHeight, maxHeightForImage)
        pdf.addImage(satelliteImageUrl, 'PNG', margin, yPosition, imgWidth, actualImgHeight)
        yPosition += actualImgHeight + 10
      }

      // Check if we need a new page for heatmap
      if (heatmapImageUrl) {
        const actualImgHeight = Math.min(imgHeight, maxHeightForImage)
        
        // If not enough space, add new page
        if (yPosition + actualImgHeight + 25 > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
          
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(0, 0, 0)
          pdf.text('Visual Analysis (continued)', margin, yPosition)
          yPosition += 10
        }

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        pdf.text('2. Solar Flux Heatmap', margin, yPosition)
        yPosition += 4

        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(80, 80, 80)
        const heatmapDesc = 'Color-coded visualization of solar irradiance. Red/yellow areas receive the most sunlight, while blue/dark areas receive less. Optimal panel placement should prioritize high-flux (bright) zones.'
        const descLines = pdf.splitTextToSize(heatmapDesc, contentWidth)
        pdf.text(descLines, margin, yPosition)
        yPosition += descLines.length * 3.5 + 2

        pdf.addImage(heatmapImageUrl, 'PNG', margin, yPosition, imgWidth, actualImgHeight)
        yPosition += actualImgHeight + 5

        // Add color scale legend
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'italic')
        pdf.text('Color Scale: Dark Blue (Low) < Green < Yellow < Orange < Red (High Solar Potential)', margin, yPosition)
      } else {
        // If heatmap is missing, show explanation
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        pdf.text('2. Solar Flux Heatmap', margin, yPosition)
        yPosition += 5

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(150, 0, 0)
        pdf.text('Heatmap data not available for this location.', margin, yPosition)
        yPosition += 4

        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(80, 80, 80)
        pdf.text('This may be due to limited satellite coverage in rural areas.', margin, yPosition)
      }
    } catch (error) {
      console.error('Error adding images to PDF:', error)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(200, 0, 0)
      pdf.text('Error loading visual analysis images. Please ensure your internet connection is stable.', margin, yPosition)
    }
  }

  // Add new page for additional information
  pdf.addPage()
  yPosition = margin

  // Next Steps Section
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text('Next Steps & Recommendations', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(40, 40, 40)

  const steps = [
    { title: '1. Get Professional Quotes', desc: 'Contact 3-5 certified solar installers for detailed site assessments and competitive quotes.' },
    { title: '2. Check Local Incentives', desc: 'Research government rebates, tax credits, and net metering programs in your area to maximize savings.' },
    { title: '3. Consider Financing Options', desc: 'Explore solar loans, leases, or power purchase agreements (PPAs) to minimize upfront costs.' },
    { title: '4. Join a Solar Co-op', desc: 'Connect with neighbors through SolarMatch to negotiate group discounts and share installation costs.' },
  ]

  steps.forEach((step) => {
    pdf.setFont('helvetica', 'bold')
    pdf.text(step.title, margin, yPosition)
    yPosition += 5
    pdf.setFont('helvetica', 'normal')
    const descLines = pdf.splitTextToSize(step.desc, contentWidth - 5)
    pdf.text(descLines, margin + 5, yPosition)
    yPosition += descLines.length * 5 + 3
  })

  yPosition += 5

  // Disclaimer and Additional Info
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Important Disclaimers', margin, yPosition)
  yPosition += 8

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(60, 60, 60)
  
  const disclaimerText = [
    'This report provides estimated values based on satellite analysis and average industry data.',
    'Actual costs, savings, and energy production may vary significantly depending on:',
    '',
  ]

  disclaimerText.forEach((line) => {
    const textLines = pdf.splitTextToSize(line, contentWidth)
    pdf.text(textLines, margin, yPosition)
    yPosition += textLines.length * 4.5
  })

  // Bullet points without special characters
  const bulletPoints = [
    'Your local electricity rates and utility policies',
    'Available government incentives and solar rebates',
    'Specific roof conditions (age, material, structural integrity, shading)',
    'Equipment brand, type, and quality selected',
    'Installation complexity and labor costs in your area',
    'Local weather patterns and seasonal sunlight variations',
    'System maintenance requirements and warranty coverage',
  ]

  bulletPoints.forEach((point) => {
    // Draw a simple circle as bullet
    pdf.setFillColor(255, 153, 51)
    pdf.circle(margin + 2, yPosition - 1.5, 0.8, 'F')
    
    const textLines = pdf.splitTextToSize(point, contentWidth - 8)
    pdf.text(textLines, margin + 6, yPosition)
    yPosition += textLines.length * 4.5
  })

  yPosition += 4
  pdf.setFont('helvetica', 'bold')
  const closingText = 'We strongly recommend obtaining professional site assessments and multiple quotes from certified solar installers before making any investment decisions.'
  const closingLines = pdf.splitTextToSize(closingText, contentWidth)
  pdf.text(closingLines, margin, yPosition)
  yPosition += closingLines.length * 5

  yPosition += 5
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  const analysisNote = `This analysis was performed using ${results.dataSource} and represents estimates based on available data at the time of generation.`
  const noteLines = pdf.splitTextToSize(analysisNote, contentWidth)
  pdf.text(noteLines, margin, yPosition)
  yPosition += noteLines.length * 4

  if (results.note) {
    yPosition += 5
    pdf.setFont('helvetica', 'italic')
    const noteLines = pdf.splitTextToSize(`Note: ${results.note}`, contentWidth)
    pdf.text(noteLines, margin, yPosition)
  }

  // Footer on last page
  yPosition = pageHeight - 20
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(107, 114, 128)
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  pdf.text(`Generated by SolarMatch on ${date}`, margin, yPosition)
  pdf.text('www.solarmatch.com', pageWidth - margin - 30, yPosition)

  return pdf
}

export function downloadPDF(pdf: jsPDF, filename: string = 'solar-report.pdf') {
  pdf.save(filename)
}

export function openPDFInNewTab(pdf: jsPDF) {
  const pdfBlob = pdf.output('blob')
  const url = URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}
