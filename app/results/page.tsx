"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "../../components/Header"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addressFromUrl = searchParams.get('address') || "Sample Address"

  // Placeholder values - will be replaced with backend data
  const [results] = useState({
    address: addressFromUrl,
    solarSuitability: 0,
    suitabilityText: "Calculating...",
    installationCost: 0,
    paybackPeriod: 0,
    annualSavings: 0,
    co2Reduction: 0,
    usableSpace: 0,
    capacity: 0,
    satelliteImage: "/placeholder-satellite.jpg" // Placeholder image
  })

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
            
            {/* Placeholder Image */}
            <div className="w-full aspect-square bg-gradient-to-br from-blue-200 to-green-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
              <div className="text-center text-gray-600">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Satellite imagery will appear here</p>
              </div>
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
                  <p className="text-4xl font-bold text-gray-900">€{results.installationCost.toLocaleString()}</p>
                </div>

                {/* Payback Period */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg text-gray-600">Payback Period</span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{results.paybackPeriod} years</p>
                </div>

                {/* Annual Savings */}
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-lg text-gray-600">Annual Savings</span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">€{results.annualSavings.toLocaleString()}</p>
                </div>

                {/* CO2 Reduction */}
                <div className="bg-teal-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-600">CO₂ Reduction</span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{results.co2Reduction.toLocaleString()} kg</p>
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
