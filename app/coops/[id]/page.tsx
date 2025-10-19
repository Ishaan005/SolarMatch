"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "../../../components/Header"

interface CommunityDetails {
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
  total_capacity_kwp: number
  total_annual_energy_kwh: number
  total_co2_reduction_kg_year: number
  participant_count: number
  max_members: number | null
  accepting_members: boolean
  interested_count: number
  committed_count: number
  installed_count: number
  financials: {
    total_estimated_cost_eur: number
    estimated_cost_per_home_eur: number
    bulk_discount_percentage: number
    total_annual_savings_eur: number
    average_payback_years: number
  }
  coordinator_name: string | null
  coordinator_contact: string | null
  installer_name: string | null
  installer_contact: string | null
}

export default function CommunityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const communityId = params.id as string
  
  const [community, setCommunity] = useState<CommunityDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/api/coops/${communityId}`)
        
        if (!response.ok) {
          throw new Error('Community not found')
        }
        
        const data = await response.json()
        setCommunity(data)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching community:', err)
        setError(err instanceof Error ? err.message : 'Failed to load community')
        setIsLoading(false)
      }
    }
    
    if (communityId) {
      fetchCommunity()
    }
  }, [communityId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Community Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/coops')}
              className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Back to Communities
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {community.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  community.status === 'active' ? 'bg-green-100 text-green-700' :
                  community.status === 'coordinating' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {community.status === 'planning' ? 'Planning' :
                   community.status === 'coordinating' ? 'Coordinating' :
                   community.status === 'installing' ? 'Installing' :
                   community.status === 'active' ? 'Active' : community.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{community.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{community.location.address}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">
                    {community.participant_count}
                    {community.max_members ? ` / ${community.max_members}` : ''} members
                  </span>
                </div>
                {community.max_members && community.participant_count >= community.max_members && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Full
                  </span>
                )}
                {community.accepting_members && (!community.max_members || community.participant_count < community.max_members) && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Accepting Members
                  </span>
                )}
              </div>
            </div>

            {/* Join Button */}
            <div className="flex flex-col gap-3">
              {community.accepting_members && (!community.max_members || community.participant_count < community.max_members) ? (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Request to Join
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                >
                  Currently Full
                </button>
              )}
              <button
                onClick={() => window.location.href = `mailto:${community.coordinator_contact}?subject=Question about ${community.name}`}
                className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-medium border-2 border-gray-300 transition-colors"
              >
                Contact Coordinator
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {community.participant_count}
                  {community.max_members && <span className="text-lg text-gray-500">/{community.max_members}</span>}
                </div>
                <div className="text-sm text-gray-600">
                  {community.max_members && community.participant_count >= community.max_members ? 'Members (Full)' : 'Members'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{community.total_capacity_kwp.toFixed(0)}</div>
                <div className="text-sm text-gray-600">kWp Capacity</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{community.financials.bulk_discount_percentage.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Bulk Discount</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{(community.total_co2_reduction_kg_year / 1000).toFixed(1)}</div>
                <div className="text-sm text-gray-600">Tonnes CO₂/year</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Solar Potential */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Aggregate Solar Potential
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Total Annual Energy</span>
                  <span className="font-semibold text-gray-900">
                    {community.total_annual_energy_kwh.toLocaleString()} kWh/year
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Total Capacity</span>
                  <span className="font-semibold text-gray-900">
                    {community.total_capacity_kwp.toFixed(1)} kWp
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Annual Savings (Community)</span>
                  <span className="font-semibold text-green-600">
                    €{community.financials.total_annual_savings_eur.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">CO₂ Reduction</span>
                  <span className="font-semibold text-gray-900">
                    {(community.total_co2_reduction_kg_year / 1000).toFixed(1)} tonnes/year
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cost Savings Through Coordination
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900">Bulk Discount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {community.financials.bulk_discount_percentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Achieved by coordinating {community.participant_count} homes together
                  </p>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Estimated Cost Per Home</span>
                  <span className="font-semibold text-gray-900">
                    €{community.financials.estimated_cost_per_home_eur.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Average Payback Period</span>
                  <span className="font-semibold text-gray-900">
                    {community.financials.average_payback_years.toFixed(1)} years
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Total Community Cost</span>
                  <span className="font-semibold text-gray-900">
                    €{community.financials.total_estimated_cost_eur.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Participation & Contact */}
          <div className="space-y-6">
            {/* Participation Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Participation Status
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Participants</span>
                  <span className="font-semibold text-gray-900">{community.participant_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Interested</span>
                  <span className="font-semibold text-amber-600">{community.interested_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Committed</span>
                  <span className="font-semibold text-blue-600">{community.committed_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Installed</span>
                  <span className="font-semibold text-green-600">{community.installed_count}</span>
                </div>
              </div>
            </div>

            {/* Coordinator Info */}
            {community.coordinator_name && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Community Coordinator
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{community.coordinator_name}</div>
                      <a 
                        href={`mailto:${community.coordinator_contact}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {community.coordinator_contact}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                How to Participate
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Express interest to join the coordination effort</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Get your home analyzed for solar potential</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Receive bulk pricing quotes from installers</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Each home decides individually whether to proceed</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Join Modal */}
        {showJoinModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Request to Join</h3>
                <p className="text-gray-600 mb-4">
                  You're about to request to join <strong>{community.name}</strong>. The community coordinator will review your request and contact you with next steps.
                </p>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-purple-900 font-medium">Current Members:</span>
                    <span className="text-purple-900 font-bold">
                      {community.participant_count}
                      {community.max_members && ` / ${community.max_members}`}
                    </span>
                  </div>
                  {community.max_members && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-900 font-medium">Available Spots:</span>
                      <span className="text-purple-900 font-bold">
                        {community.max_members - community.participant_count}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `mailto:${community.coordinator_contact}?subject=Request to Join ${community.name}&body=Hi,%0D%0A%0D%0AI would like to request to join the ${community.name} community solar project.%0D%0A%0D%0APlease let me know the next steps to become a member.%0D%0A%0D%0AThank you!`
                      setShowJoinModal(false)
                    }}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
