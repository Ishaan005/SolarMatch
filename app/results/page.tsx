"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "../../components/Header"

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addressFromUrl = searchParams.get('address') || "Sample Address"
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const [results, setResults] = useState<any>({ // Using 'any' for now, consider a proper type
    address: addressFromUrl,
    solarSuitability: 0,
    suitabilityText: "Calculating...",
    installationCost: 0,
    paybackPeriod: 0,
    annualSavings: 0,
    co2Reduction: 0,
    usableSpace: 0,
    capacity: 0,
    satelliteImage: "", // Will be loaded from backend
    analysis: null, // To store the new analysis data
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchAnalysisAndImage = async () => {
      if (!lat || !lng) {
        setError("Latitude and longitude are required.");
        setIsLoading(false);
        setIsLoadingImage(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch analysis data
        const analysisUrl = `http://localhost:8000/api/solar/analysis?latitude=${lat}&longitude=${lng}&radius_meters=50`;
        const analysisResponse = await fetch(analysisUrl);

        if (!analysisResponse.ok) {
          throw new Error(`Failed to fetch analysis: ${analysisResponse.status}`);
        }

        const data = await analysisResponse.json();
        
        // A simple model for solar suitability based on mean flux
        const meanFlux = data.flux_stats?.mean || 0;
        const solarSuitability = Math.min(100, Math.round((meanFlux / 1500) * 100));

        // Simplified financial model
        const usableSpace = data.estimated_roof_area_sq_meters || 0;
        const capacity = parseFloat((usableSpace / 8).toFixed(2)); // Approx. 8 sqm per kW
        const installationCost = Math.round(capacity * 1200); // Approx. €1200 per kW
        const annualEnergy = data.estimated_annual_energy_kwh || 0;
        const annualSavings = Math.round(annualEnergy * 0.30); // Approx. €0.30 per kWh
        const paybackPeriod = annualSavings > 0 ? parseFloat((installationCost / annualSavings).toFixed(1)) : 0;
        const co2Reduction = Math.round(annualEnergy * 0.4); // Approx. 0.4 kg CO2 per kWh

        setResults(prev => ({
          ...prev,
          analysis: data,
          solarSuitability,
          suitabilityText: `Based on an average solar flux of ${Math.round(meanFlux)} kWh/kW/year.`,
          usableSpace: usableSpace,
          capacity: capacity,
          installationCost,
          annualSavings,
          paybackPeriod,
          co2Reduction,
        }));

        // Fetch satellite image
        if (data.imagery_urls?.rgb) {
            setIsLoadingImage(true);
            const imageUrl = `http://localhost:8000/api/solar/rgb-image?latitude=${lat}&longitude=${lng}&radius_meters=50`;
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch satellite image: ${imageResponse.status}`);
            }
            const blob = await imageResponse.blob();
            const objectURL = URL.createObjectURL(blob);
            setResults(prev => ({ ...prev, satelliteImage: objectURL }));
            setIsLoadingImage(false);
        } else {
            setImageError(true);
            setIsLoadingImage(false);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || "An unknown error occurred.");
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisAndImage();
  }, [lat, lng]);

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (results.satelliteImage && results.satelliteImage.startsWith('blob:')) {
        URL.revokeObjectURL(results.satelliteImage)
      }
    }
  }, [results.satelliteImage])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Analysis Complete
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Rooftop Analysis Results
        </h1>
        <p className="text-sm text-gray-600 mb-6">{results.address}</p>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left Column - Satellite View */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Satellite View
            </h2>
            
            {/* Satellite Image */}
            <div className="w-full aspect-square bg-gradient-to-br from-blue-200 to-green-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
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
                  alt="Satellite view of rooftop" 
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

            {/* Capacity Info */}
            <p className="text-xs text-gray-600">
              <span className="font-semibold">{results.usableSpace}m²</span> usable space • <span className="font-semibold">{results.capacity} kW</span> capacity
            </p>
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
              <div className="mb-2">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {results.solarSuitability}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-gradient-to-r from-gray-800 to-gray-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${results.solarSuitability}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{results.suitabilityText}</p>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-10 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                Financial Overview
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Installation Cost */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-600">Installation Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{results.installationCost.toLocaleString()}</p>
                </div>

                {/* Payback Period */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg text-gray-600">Payback Period</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{results.paybackPeriod} years</p>
                </div>

                {/* Annual Savings */}
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-lg text-gray-600">Annual Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{results.annualSavings.toLocaleString()}</p>
                </div>

                {/* CO2 Reduction */}
                <div className="bg-teal-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-600">CO₂ Reduction</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{results.co2Reduction.toLocaleString()} kg</p>
                </div>
              </div>
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
                  onClick={() => router.push('/coops')}
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
