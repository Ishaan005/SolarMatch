"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "../../components/Header"
import { generateSolarPDF, downloadPDF } from "../../lib/pdfGenerator"

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addressFromUrl = searchParams.get('address') || "Sample Address"
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const [results, setResults] = useState({
    address: addressFromUrl,
    solarSuitability: 0,
    suitabilityText: "Calculating...",
    installationCost: 0,
    seaiGrant: 2400,
    netCost: 0,
    paybackPeriod: 0,
    annualSavings: 0,
    savingsBreakdown: {
      selfConsumption: 0,
      exportIncome: 0
    },
    co2Reduction: 0,
    usableSpace: 0,
    capacity: 0,
    satelliteImage: "", // Will be loaded from backend
    heatmapImage: "", // Solar flux heatmap
    dataSource: "", // "Google Solar API" or "PVGIS"
    hasImagery: true, // Whether high-res imagery is available
    note: "" // Additional info for rural areas
  })

  const [isLoadingImage, setIsLoadingImage] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'satellite' | 'heatmap'>('satellite')
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(true)
  const [heatmapError, setHeatmapError] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Handler for PDF generation
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true)
      
      console.log('Generating PDF with images:', {
        hasSatellite: !!results.satelliteImage,
        hasHeatmap: !!results.heatmapImage
      })
      
      const pdf = await generateSolarPDF(
        results,
        results.satelliteImage || undefined,
        results.heatmapImage || undefined
      )
      
      const filename = `solar-report-${results.address.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      downloadPDF(pdf, filename)
      
      console.log('PDF generated successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF report. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Fetch solar analysis data from backend
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!lat || !lng) {
        setIsLoadingAnalysis(false)
        setAnalysisError("No coordinates provided")
        return
      }

      try {
        setIsLoadingAnalysis(true)
        setAnalysisError(null)
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        // Use 10m radius for residential properties (covers ~314 m² area - typical single home)
        const analysisUrl = `${backendUrl}/api/solar/analysis?latitude=${lat}&longitude=${lng}&radius_meters=10`
        const response = await fetch(analysisUrl)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
          console.error('Analysis API Error:', response.status, errorData)
          setAnalysisError(errorData.detail || 'Failed to fetch solar analysis')
          setIsLoadingAnalysis(false)
          return
        }

        const data = await response.json()
        
        // Store data source information
        const dataSource = data.data_source || "Google Solar API"
        const hasImagery = data.has_imagery !== false
        const note = data.note || ""
        
        // Calculate solar suitability based on mean flux
        // Good solar potential: 1200-1500+ kWh/kW/year
        const meanFlux = data.flux_stats?.mean || 0
        const solarSuitability = Math.min(100, Math.round((meanFlux / 1500) * 100))
        
        let suitabilityText = "Poor solar potential"
        if (solarSuitability >= 80) {
          suitabilityText = "Excellent solar potential"
        } else if (solarSuitability >= 60) {
          suitabilityText = "Good solar potential"
        } else if (solarSuitability >= 40) {
          suitabilityText = "Fair solar potential"
        }
        
        // Get areas from backend (prefer usable area if available)
        const totalRoofArea = data.estimated_roof_area_sq_meters || 0
        const usableSpace = data.usable_roof_area_sq_meters || totalRoofArea
        
        // Get capacity from backend (it's already calculated properly there)
        const capacity = data.estimated_capacity_kwp || 0
        
        // Financial calculations - Updated for 2024 Irish market
        // Typical residential solar costs in Ireland (2024):
        // - Small systems (<4 kWp): €1,400-€1,600 per kWp
        // - Medium systems (4-8 kWp): €1,200-€1,400 per kWp  
        // - Larger systems (>8 kWp): €1,000-€1,200 per kWp
        // Using sliding scale based on system size
        let costPerKwp = 1400 // Default for small systems
        if (capacity > 8) {
          costPerKwp = 1100 // Larger systems benefit from economies of scale
        } else if (capacity > 4) {
          costPerKwp = 1300 // Medium systems
        }
        
        const installationCost = Math.round(capacity * costPerKwp)
        
        // SEAI Solar PV Grant (2025) - Use backend calculation or fallback
        // 2025 rates: €700/kWp up to 2kWp, then €200/kWp up to 4kWp, max €1,800
        let seaiGrant = 1800 // Default to maximum
        
        if (data.seai_grant?.grant_amount) {
          // Use grant amount from backend if available
          seaiGrant = Math.round(data.seai_grant.grant_amount)
        } else {
          // Calculate grant based on capacity (2025 structure)
          if (capacity <= 2.0) {
            seaiGrant = Math.round(capacity * 700)
          } else if (capacity <= 4.0) {
            seaiGrant = Math.round(2.0 * 700 + (capacity - 2.0) * 200)
          } else {
            seaiGrant = 1800 // Maximum for 4kWp+
          }
        }
        
        const netInstallationCost = Math.max(0, installationCost - seaiGrant)
        
        // Get annual energy from backend
        const annualEnergy = data.estimated_annual_energy_kwh || 0
        
        // Self-consumption model (more accurate than simple multiplication)
        // Without battery: typical home uses 30-40% of solar directly
        // Remaining is exported to grid at lower rate
        const selfConsumptionRate = 0.35  // 35% used directly (conservative)
        const importElectricityRate = 0.38  // €/kWh - cost of grid electricity
        const exportElectricityRate = 0.185  // €/kWh - Clean Export Guarantee rate (2024)
        
        const selfConsumedEnergy = annualEnergy * selfConsumptionRate
        const exportedEnergy = annualEnergy * (1 - selfConsumptionRate)
        
        // Calculate realistic annual savings
        const savingsFromSelfConsumption = Math.round(selfConsumedEnergy * importElectricityRate)
        const incomeFromExport = Math.round(exportedEnergy * exportElectricityRate)
        const annualSavings = savingsFromSelfConsumption + incomeFromExport
        
        // Payback period using net cost (after grant)
        const paybackPeriod = annualSavings > 0 ? parseFloat((netInstallationCost / annualSavings).toFixed(1)) : 0
        
        // CO2 reduction - Ireland grid average: 0.35 kg CO2 per kWh (2024)
        const co2Reduction = Math.round(annualEnergy * 0.35)
        
        setResults(prev => ({
          ...prev,
          solarSuitability,
          suitabilityText,
          usableSpace,
          capacity,
          installationCost,
          seaiGrant,
          netCost: netInstallationCost,
          annualSavings,
          savingsBreakdown: {
            selfConsumption: savingsFromSelfConsumption,
            exportIncome: incomeFromExport
          },
          paybackPeriod,
          co2Reduction,
          dataSource,
          hasImagery,
          note
        }))
        
        setIsLoadingAnalysis(false)
      } catch (error) {
        console.error('Error fetching analysis:', error)
        setAnalysisError(error instanceof Error ? error.message : 'Failed to fetch analysis')
        setIsLoadingAnalysis(false)
      }
    }
    
    fetchAnalysis()
  }, [lat, lng])

  // Fetch satellite image from backend
  useEffect(() => {
    const fetchSatelliteImage = async () => {
      if (!lat || !lng) {
        setIsLoadingImage(false)
        setImageError(true)
        return
      }

      try {
        setIsLoadingImage(true)
        setImageError(false)
        
        // Use optimized parameters for faster loading
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        // Use 30m radius for imagery (good visual context) but 10m for analysis (focused calculation)
        const url = `${backendUrl}/api/solar/rgb-image?latitude=${lat}&longitude=${lng}&radius_meters=50&max_width=800&max_height=800`
        
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch satellite image: ${response.status}`)
        }

        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        
        // Preload the image to ensure it's ready before displaying
        const img = new Image()
        img.onload = () => {
          setResults(prev => ({
            ...prev,
            satelliteImage: imageUrl
          }))
          setIsLoadingImage(false)
        }
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl)
          setImageError(true)
          setIsLoadingImage(false)
        }
        img.src = imageUrl
        
      } catch (error) {
        console.error('Error fetching satellite image:', error)
        setImageError(true)
        setIsLoadingImage(false)
      }
    }
    
    fetchSatelliteImage()
  }, [lat, lng])

  // Fetch solar flux heatmap from backend
  useEffect(() => {
    const fetchHeatmap = async () => {
      if (!lat || !lng) {
        console.log('Heatmap fetch skipped: No coordinates')
        setIsLoadingHeatmap(false)
        setHeatmapError(true)
        return
      }

      try {
        setIsLoadingHeatmap(true)
        setHeatmapError(false)
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        // Use 30m radius for heatmap display (matches satellite view for consistency)
        const url = `${backendUrl}/api/solar/annual-flux-heatmap?latitude=${lat}&longitude=${lng}&radius_meters=30&colormap=hot&max_width=800&max_height=800`
        
        console.log('Fetching heatmap from:', url)
        const response = await fetch(url)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Heatmap fetch failed:', response.status, errorText)
          throw new Error(`Failed to fetch heatmap: ${response.status}`)
        }

        const blob = await response.blob()
        console.log('Heatmap blob received:', blob.size, 'bytes')
        const imageUrl = URL.createObjectURL(blob)
        
        // Preload the image to ensure it's ready before displaying
        const img = new Image()
        img.onload = () => {
          console.log('Heatmap image loaded successfully')
          setResults(prev => ({
            ...prev,
            heatmapImage: imageUrl
          }))
          setIsLoadingHeatmap(false)
        }
        img.onerror = () => {
          console.error('Heatmap image failed to load')
          URL.revokeObjectURL(imageUrl)
          setHeatmapError(true)
          setIsLoadingHeatmap(false)
        }
        img.src = imageUrl
        
      } catch (error) {
        console.error('Error fetching heatmap:', error)
        setHeatmapError(true)
        setIsLoadingHeatmap(false)
      }
    }
    
    fetchHeatmap()
  }, [lat, lng])

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (results.satelliteImage && results.satelliteImage.startsWith('blob:')) {
        URL.revokeObjectURL(results.satelliteImage)
      }
      if (results.heatmapImage && results.heatmapImage.startsWith('blob:')) {
        URL.revokeObjectURL(results.heatmapImage)
      }
    }
  }, [results.satelliteImage, results.heatmapImage])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Badge and Action Buttons */}
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isLoadingAnalysis ? (
              <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <svg className="inline w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Solar Potential...
              </span>
            ) : analysisError ? (
              <span className="inline-block px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Analysis Failed
              </span>
            ) : (
              <>
                <span className="inline-block px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Analysis Complete
                </span>
                {results.dataSource && (
                  <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {results.dataSource === "PVGIS" ? "Modeled Data" : "High-Res Imagery"}
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* PDF Download Button */}
          {!isLoadingAnalysis && !analysisError && (
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Download PDF Report"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Info Banner for Rural Areas */}
        {!isLoadingAnalysis && results.dataSource === "PVGIS" && results.note && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">Rural Area Analysis</h3>
                <p className="text-xs text-amber-800">{results.note}</p>
                <p className="text-xs text-amber-700 mt-2">
                  <strong>Tip:</strong> For the most accurate results, consider a professional site survey to measure your actual roof area.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Solar Analysis Results
        </h1>
        <p className="text-sm text-gray-600 mb-6">{results.address}</p>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left Column - Imagery View */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                {viewMode === 'satellite' ? 'Satellite View' : 'Solar Flux Heatmap'}
              </h2>
              
              {/* Toggle Buttons - Only show if imagery is available */}
              {results.hasImagery && (
                <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('satellite')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === 'satellite'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setViewMode('heatmap')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === 'heatmap'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Heat Map
                  </button>
                </div>
              )}
            </div>            {/* Image Display */}
            <div className="w-full aspect-square bg-gradient-to-br from-blue-200 to-green-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
              {!results.hasImagery ? (
                // No imagery available (rural area)
                <div className="text-center text-gray-700 p-8">
                  <svg className="w-16 h-16 mx-auto mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm font-semibold mb-2">No Satellite Imagery Available</p>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto">
                    This rural location isn&apos;t covered by high-resolution imagery yet. 
                    Solar analysis is based on regional solar radiation data.
                  </p>
                  <div className="mt-4 p-3 bg-white/60 rounded-lg text-xs">
                    <p className="font-semibold text-gray-800 mb-1">What this means:</p>
                    <ul className="text-left text-gray-700 space-y-1">
                      <li>• Solar potential estimates are reliable</li>
                      <li>• Based on satellite weather data</li>
                      <li>• Consider a site survey for details</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  {/* Satellite Image - Always rendered but conditionally visible */}
                  <div className={`absolute inset-0 flex items-center justify-center ${viewMode === 'satellite' ? 'block' : 'hidden'}`}>
                    {isLoadingImage ? (
                      <div className="text-center text-gray-600">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xs">Loading satellite imagery...</p>
                      </div>
                    ) : imageError ? (
                      <div className="text-center text-gray-600">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs">Could not load satellite imagery</p>
                        <p className="text-xs text-gray-500 mt-1">Make sure the backend is running</p>
                      </div>
                    ) : results.satelliteImage ? (
                      <img 
                        src={results.satelliteImage} 
                        alt="Satellite view of location" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center text-gray-600">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">No coordinates provided</p>
                      </div>
                    )}
                  </div>

                  {/* Heatmap Image - Always rendered but conditionally visible */}
                  <div className={`absolute inset-0 flex items-center justify-center ${viewMode === 'heatmap' ? 'block' : 'hidden'}`}>
                    {isLoadingHeatmap ? (
                      <div className="text-center text-gray-600">
                        <svg className="w-12 h-12 mx-auto mb-2 text-orange-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xs">Generating solar flux heatmap...</p>
                      </div>
                    ) : heatmapError ? (
                      <div className="text-center text-gray-600">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs">Could not load solar flux data</p>
                        <p className="text-xs text-gray-500 mt-1">Not available for this location</p>
                      </div>
                    ) : results.heatmapImage ? (
                      <>
                        <img 
                          src={results.heatmapImage} 
                          alt="Solar flux heatmap" 
                          className="w-full h-full object-contain rounded-xl"
                        />
                        {/* Heatmap Legend */}
                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300 rounded"></div>
                            <span className="font-semibold">Solar Irradiance</span>
                          </div>
                          <p className="text-gray-600">Red = Low | Yellow = High</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-600">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">No heatmap data</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Info Text Below Image */}
            {viewMode === 'satellite' ? (
              <p className="text-xs text-gray-600">
                <span className="font-semibold">{results.usableSpace.toFixed(0)}m²</span> usable roof area • <span className="font-semibold">{results.capacity} kWp</span> capacity
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Warmer colors</span> indicate areas with higher solar potential • Best for panel placement
              </p>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-5">
            {/* Solar Suitability Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900">
                  Solar Suitability
                </h2>
              </div>

              {/* Percentage and Progress Bar */}
              {isLoadingAnalysis ? (
                <div className="text-center py-4">
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded w-24 mb-2 mx-auto"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ) : analysisError ? (
                <div className="text-center py-4">
                  <svg className="w-10 h-10 mx-auto mb-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Unable to calculate solar potential</p>
                  <p className="text-xs text-gray-600">{analysisError}</p>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {results.solarSuitability}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${results.solarSuitability}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">{results.suitabilityText}</p>
                </div>
              )}
            </div>

            {/* Financial Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-10 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Financial Overview
                </h2>
                {!isLoadingAnalysis && !analysisError && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hover for calculation details
                  </span>
                )}
              </div>

              {isLoadingAnalysis ? (
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : analysisError ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Financial data unavailable</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                {/* Installation Cost */}
                <div className="bg-blue-50 rounded-xl p-6 relative group cursor-help transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg text-gray-600">Net Cost</span>
                    </div>
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{results.netCost.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">After SEAI Grant</p>
                  
                  {/* Hover Tooltip */}
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-blue-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="text-sm space-y-2">
                      <div className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        How We Calculated This
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>System capacity:</span>
                        <span className="font-mono font-semibold">{results.capacity} kWp</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Cost per kWp:</span>
                        <span className="font-mono font-semibold">€{Math.round(results.installationCost / results.capacity).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between text-gray-700">
                        <span>Gross cost:</span>
                        <span className="font-mono">€{results.installationCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-green-700 font-semibold">
                        <span>SEAI Grant:</span>
                        <span className="font-mono">-€{results.seaiGrant.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-semibold text-blue-900">
                        <span>Net cost:</span>
                        <span className="font-mono">€{results.netCost.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-3 pt-2 border-t border-blue-100">
                        2025 SEAI Grant: €700/kWp up to 2kWp, then €200/kWp up to 4kWp (max €1,800)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payback Period */}
                <div className="bg-purple-50 rounded-xl p-6 relative group cursor-help transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-lg text-gray-600">Payback Period</span>
                    </div>
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{results.paybackPeriod} years</p>
                  
                  {/* Hover Tooltip */}
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-purple-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="text-sm space-y-2">
                      <div className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        How We Calculated This
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Net investment:</span>
                        <span className="font-mono font-semibold">€{results.netCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Annual savings:</span>
                        <span className="font-mono font-semibold">€{results.annualSavings.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-purple-200 pt-2 mt-2 flex justify-between font-semibold text-purple-900">
                        <span>Payback:</span>
                        <span className="font-mono text-sm">€{results.netCost.toLocaleString()} ÷ €{results.annualSavings.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-purple-600 mt-3 pt-2 border-t border-purple-100">
                        After this period, you&apos;ll benefit from free electricity for 25+ years. Net cost includes SEAI grant.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Annual Savings */}
                <div className="bg-green-50 rounded-xl p-6 relative group cursor-help transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-lg text-gray-600">Annual Savings</span>
                    </div>
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{results.annualSavings.toLocaleString()}</p>
                  
                  {/* Hover Tooltip */}
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-green-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="text-sm space-y-2">
                      <div className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        How We Calculated This
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Self-consumed:</span>
                        <span className="font-mono font-semibold">€{results.savingsBreakdown.selfConsumption.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Export income:</span>
                        <span className="font-mono font-semibold">€{results.savingsBreakdown.exportIncome.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-green-200 pt-2 mt-2 flex justify-between font-semibold text-green-900">
                        <span>Total annual value:</span>
                        <span className="font-mono text-sm">€{results.annualSavings.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-3 pt-2 border-t border-green-100">
                        Self-consumption @€0.38/kWh, export @€0.185/kWh (Clean Export Guarantee). Add battery to increase self-consumption to 70%+.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CO2 Reduction */}
                <div className="bg-teal-50 rounded-xl p-6 relative group cursor-help transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg text-gray-600">CO₂ Reduction</span>
                    </div>
                    <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{results.co2Reduction.toLocaleString()} kg</p>
                  
                  {/* Hover Tooltip */}
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-teal-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="text-sm space-y-2">
                      <div className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        How We Calculated This
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Annual energy:</span>
                        <span className="font-mono font-semibold">{Math.round(results.co2Reduction / 0.35).toLocaleString()} kWh</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>CO₂ intensity:</span>
                        <span className="font-mono font-semibold">0.35 kg/kWh</span>
                      </div>
                      <div className="border-t border-teal-200 pt-2 mt-2 flex justify-between font-semibold text-teal-900">
                        <span>CO₂ saved:</span>
                        <span className="font-mono text-sm">{Math.round(results.co2Reduction / 0.35).toLocaleString()} kWh × 0.35</span>
                      </div>
                      <p className="text-xs text-teal-600 mt-3 pt-2 border-t border-teal-100">
                        Equivalent to planting {Math.round(results.co2Reduction / 20)} trees per year
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Co-op Section */}
        <div className="mt-6">
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl shadow-sm p-5 border border-purple-200">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-200 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Join a Neighbourhood Solar Co-op
                </h2>
                <p className="text-xs text-gray-600 mb-2">
                  Share costs with neighbours and reduce investment by up to 40%
                </p>
                <button 
                  onClick={() => router.push(`/coops?lat=${lat}&lng=${lng}&address=${encodeURIComponent(results.address)}`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  Explore Co-op Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
