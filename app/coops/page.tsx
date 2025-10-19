"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import { Suspense } from "react"

interface Coop {
  id: string
  name: string
  description: string
  location: {
    address: string
    county: string
    latitude: number
    longitude: number
  }
  status: string
  member_count: number
  max_members: number | null
  distance_km: number | null
  cost_reduction_pct: number
  capacity_kwp: number
  annual_energy_kwh: number
  share_price_eur: number
  funding_percentage: number
  accepting_members: boolean
}

function CoopsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const address = searchParams.get('address') || "your location"
  
  const [coops, setCoops] = useState<Coop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCoops = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const params = new URLSearchParams()
        
        if (lat && lng) {
          params.append('latitude', lat)
          params.append('longitude', lng)
        }
        params.append('max_distance_km', '100')
        params.append('accepting_members', 'true')
        
        const url = `${backendUrl}/api/coops/search?${params.toString()}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch co-ops')
        }
        
        const data = await response.json()
        setCoops(data.coops || [])
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching co-ops:', err)
        setError(err instanceof Error ? err.message : 'Failed to load co-ops')
        setIsLoading(false)
      }
    }
    
    fetchCoops()
  }, [lat, lng])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Neighbourhood Solar Co-ops
        </h1>
        <p className="text-gray-600 mb-10">Co-ops near {address}</p>

        {/* Why Join Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50/50 rounded-2xl shadow-sm p-8 border border-purple-100 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Why Join a Solar Co-op?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Share installation and equipment costs
                </h3>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Bulk purchasing discounts up to 40%
                </h3>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Community support and shared expertise
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Co-ops Section */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isLoading ? 'Loading co-ops...' : `${coops.length} Co-ops in Your Area`}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-200"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : coops.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-900 font-semibold mb-2">No co-ops found in your area</p>
            <p className="text-amber-700 text-sm">Consider starting your own solar co-op below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coops.map((coop) => (
              <div 
                key={coop.id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Left side - Icon and Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                        <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {coop.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{coop.description}</p>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{coop.member_count} members</span>
                        </div>
                        {coop.distance_km !== null && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{coop.distance_km} km away</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>{coop.capacity_kwp} kW capacity</span>
                        </div>
                      </div>

                      {/* Cost reduction */}
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Average {coop.cost_reduction_pct}% cost reduction</span>
                      </div>

                      {/* Funding progress */}
                      {coop.status === 'fundraising' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Funding Progress</span>
                            <span>{coop.funding_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(coop.funding_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Status and Button */}
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      !coop.accepting_members
                        ? "bg-gray-200 text-gray-700" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {coop.accepting_members ? "Accepting Members" : "Full"}
                    </span>
                    <button 
                      className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!coop.accepting_members}
                      onClick={() => router.push(`/coops/${coop.id}`)}
                    >
                      {coop.accepting_members ? "Request to Join" : "View Details"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Your Own Co-op Section */}
        <div className="mt-8 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white/50">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Start Your Own Co-op
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Don't see a co-op that fits? Create one and invite your neighbours to join you.
          </p>
          <button 
            onClick={() => router.push(`/coops/create?lat=${lat}&lng=${lng}&address=${address}`)}
            className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-medium border-2 border-gray-300 transition-colors"
          >
            Create New Co-op
          </button>
        </div>

        {/* Check Another Address Button */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => router.push('/analyze')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Check Another Address</span>
          </button>
        </div>
      </main>
    </div>
  )
}

export default function CoopsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading co-ops...</p>
        </div>
      </div>
    }>
      <CoopsContent />
    </Suspense>
  )
}
