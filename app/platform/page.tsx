import Header from "../../components/Header"

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Orange Gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block px-6 py-2.5 bg-white text-orange-600 rounded-full text-sm font-semibold mb-6">
            For Solar Companies & Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            SolarMatch Platform Overview
          </h1>
          <p className="text-lg md:text-xl text-white text-opacity-95 leading-relaxed max-w-3xl mx-auto">
            Connecting citizens, councils, and solar companies through AI-powered rooftop analysis 
            powered by satellite data, geospatial APIs, and advanced mathematical modeling.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-16">
        {/* What We Do */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            What We Do
          </h2>
          <p className="text-base text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
            SolarMatch is a data-driven platform that analyzes rooftop solar potential using satellite imagery, 
            geospatial data, and solar radiation models to provide accurate, actionable insights for homeowners and installers.
          </p>
        </div>

        {/* Core Features - 3 Cards */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Satellite Imagery Analysis
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Process high-resolution satellite data to identify rooftop dimensions, orientation, and shading patterns
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Energy Production Modeling
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Calculate solar potential using PVGIS radiation data and advanced mathematical algorithms
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Community Aggregation
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Enable neighbors to form solar co-operatives for bulk purchasing and shared resources
              </p>
            </div>
          </div>
        </div>

        {/* Our Data Sources */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-16 -mx-6 px-6 mb-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
              Our Data Sources
            </h2>
            <p className="text-gray-600 text-center mb-12">
              SolarMatch integrates multiple industry-standard APIs and geodata sources to deliver precise solar assessments.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Maps API */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Maps API
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Google Maps / OpenStreetMap
                </p>
                <p className="text-gray-600 mb-6">
                  Converts user addresses to precise latitude/longitude coordinates for satellite data retrieval
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Geocoding API for address validation</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Reverse geocoding for coordinate lookup</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Location accuracy to 6 decimal places</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Supports multiple address formats</span>
                  </li>
                </ul>
              </div>

              {/* PVGIS API */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  PVGIS API
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  European Commission JRC
                </p>
                <p className="text-gray-600 mb-6">
                  Provides solar radiation database and PV performance calculations with excellent European coverage
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Historical climate data for Ireland</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Optimal tilt angle calculations</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Monthly radiation profiles</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Crystal silicon panel modeling</span>
                  </li>
                </ul>
              </div>

              {/* Solar API */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Solar API
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Google Solar API
                </p>
                <p className="text-gray-600 mb-6">
                  High-resolution satellite imagery with pre-computed solar flux layers and building segmentation
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>RGB imagery & DSM (elevation data)</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Annual flux GeoTIFF (kWh/kWp/year)</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Roof mask segmentation layers</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>Configurable radius (10m default)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Processing & Methodology */}
        <div className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Data Processing & Methodology
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Our platform transforms raw API data into actionable insights through advanced mathematical modeling 
            and geospatial analysis.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Geospatial Data Manipulation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Geospatial Data Manipulation
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">1</span>
                  <span className="text-gray-700">Download GeoTIFF files from Solar API (RGB, DSM, masks, flux layers)</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">2</span>
                  <span className="text-gray-700">Process with rasterio to extract pixel arrays and metadata (resolution, CRS)</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">3</span>
                  <span className="text-gray-700">Calculate roof area from mask pixels multiplied by pixel size (m²)</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">4</span>
                  <span className="text-gray-700">Filter usable area: flux threshold 50% of mean + 73% practical reduction factor</span>
                </div>
              </div>
            </div>

            {/* Solar Radiation Calculations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Solar Radiation Calculations
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">1</span>
                  <span className="text-gray-700">Extract mean solar flux from GeoTIFF (already in kWh/kWp/year format)</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">2</span>
                  <span className="text-gray-700">Query PVGIS for location-specific radiation data and optimal angles</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">3</span>
                  <span className="text-gray-700">Account for Irish weather patterns and atmospheric attenuation (14% losses)</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">4</span>
                  <span className="text-gray-700">Apply shading factors from 3D building models and surrounding structures</span>
                </div>
              </div>
            </div>

            {/* Energy Production Modeling */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Energy Production Modeling
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">1</span>
                  <span className="text-gray-700">Calculate system capacity: usable_area ÷ 5.5 m²/kWp (400W panel standard)</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">2</span>
                  <span className="text-gray-700">Apply performance ratio of 0.82 for inverter, temperature, and wiring losses</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">3</span>
                  <span className="text-gray-700">Formula: Energy = Capacity × Solar Flux × Performance Ratio</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">4</span>
                  <span className="text-gray-700">Estimate annual kWh generation for financial modeling</span>
                </div>
              </div>
            </div>

            {/* Financial Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Financial Analysis
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">1</span>
                  <span className="text-gray-700">Compute installation costs using tiered pricing (€1,100-€1,500 per kWp)</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">2</span>
                  <span className="text-gray-700">Calculate ROI and payback periods using €0.30/kWh electricity rate</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">3</span>
                  <span className="text-gray-700">Apply feed-in tariff parameters for grid export calculations</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mr-3 flex-shrink-0">4</span>
                  <span className="text-gray-700">Project 25-year lifecycle savings with 0.5% annual degradation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Partner With SolarMatch */}
        <div className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Partner With SolarMatch
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pre-Qualified Leads */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Pre-Qualified Leads
                </h3>
                <p className="text-gray-600">
                  Access homeowners who have already analyzed their rooftops and understand their solar potential
                </p>
              </div>
            </div>

            {/* Rich Property Data */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Rich Property Data
                </h3>
                <p className="text-gray-600">
                  Receive detailed technical specifications including roof dimensions, orientation, shading, and energy projections
                </p>
              </div>
            </div>

            {/* Bulk Installation Projects */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Bulk Installation Projects
                </h3>
                <p className="text-gray-600">
                  Connect with solar co-ops representing 5-20 properties for larger, more efficient installations
                </p>
              </div>
            </div>

            {/* Market Intelligence */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Market Intelligence
                </h3>
                <p className="text-gray-600">
                  Access geographic demand patterns and community solar adoption trends in your service area
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ready to Partner CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Partner?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join SolarMatch to access pre-qualified leads, detailed property data, and community solar projects in your area.
            </p>
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl">
              Become a Partner Company
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
