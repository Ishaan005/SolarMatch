"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import CommunityCard from "../../components/community/CommunityCard"
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
  participant_count: number
  committed_count: number
  max_members: number | null
  distance_km: number | null
  bulk_discount_pct: number
  capacity_kwp: number
  annual_savings_eur: number
  cost_per_home_eur: number
  accepting_participants: boolean
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
              <CommunityCard
                key={coop.id}
                id={coop.id}
                name={coop.name}
                description={coop.description}
                location={coop.location}
                status={coop.status}
                participant_count={coop.participant_count}
                committed_count={coop.committed_count}
                distance_km={coop.distance_km}
                bulk_discount_pct={coop.bulk_discount_pct}
                capacity_kwp={coop.capacity_kwp}
                annual_savings_eur={coop.annual_savings_eur}
                cost_per_home_eur={coop.cost_per_home_eur}
                accepting_participants={coop.accepting_participants}
                onClick={() => router.push(`/coops/${coop.id}`)}
              />
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
