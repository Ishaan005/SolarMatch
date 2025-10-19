"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "../../../components/Header"
import CommunityDetailHeader from "../../../components/community/CommunityDetailHeader"
import CommunityStats from "../../../components/community/CommunityStats"
import SolarPotentialCard from "../../../components/community/SolarPotentialCard"
import CostSavingsCard from "../../../components/community/CostSavingsCard"
import ParticipationStatusCard from "../../../components/community/ParticipationStatusCard"
import CoordinatorCard from "../../../components/community/CoordinatorCard"
import JoinModal from "../../../components/community/JoinModal"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [joinSuccess, setJoinSuccess] = useState(false)
  const [joinFormData, setJoinFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

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

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      const requestBody = {
        community_id: communityId,
        participant_name: joinFormData.name,
        participant_email: joinFormData.email,
        participant_phone: joinFormData.phone || null,
        participant_address: joinFormData.address
      }

      const response = await fetch(`${backendUrl}/api/coops/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to join community')
      }

      const data = await response.json()
      console.log('Join success:', data)
      
      setJoinSuccess(true)
      
      // Reset form
      setJoinFormData({
        name: "",
        email: "",
        phone: "",
        address: ""
      })

      // Refresh community data to show updated participant count
      const communityResponse = await fetch(`${backendUrl}/api/coops/${communityId}`)
      if (communityResponse.ok) {
        const communityData = await communityResponse.json()
        setCommunity(communityData)
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowJoinModal(false)
        setJoinSuccess(false)
      }, 2000)

    } catch (err) {
      console.error('Error joining community:', err)
      setError(err instanceof Error ? err.message : 'Failed to join community')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJoinFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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
        <CommunityDetailHeader
          name={community.name}
          description={community.description}
          status={community.status}
          acceptingParticipants={community.accepting_members && (!community.max_members || community.participant_count < community.max_members)}
          onExpressInterest={() => setShowJoinModal(true)}
          onContactCoordinator={() => window.location.href = `mailto:${community.coordinator_contact}?subject=Question about ${community.name}`}
        />

        {/* Stats Grid */}
        <CommunityStats
          participantCount={community.participant_count}
          capacityKwp={community.total_capacity_kwp}
          bulkDiscountPct={community.financials.bulk_discount_percentage}
          co2ReductionTonnes={community.total_co2_reduction_kg_year / 1000}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Solar Potential */}
            <SolarPotentialCard
              annualEnergyKwh={community.total_annual_energy_kwh}
              capacityKwp={community.total_capacity_kwp}
              annualSavingsEur={community.financials.total_annual_savings_eur}
              co2ReductionTonnes={community.total_co2_reduction_kg_year / 1000}
            />

            {/* Cost Breakdown */}
            <CostSavingsCard
              bulkDiscountPct={community.financials.bulk_discount_percentage}
              costPerHomeEur={community.financials.estimated_cost_per_home_eur}
              originalCostPerHomeEur={community.financials.estimated_cost_per_home_eur / (1 - community.financials.bulk_discount_percentage / 100)}
              annualSavingsPerHomeEur={community.financials.total_annual_savings_eur / community.participant_count}
              paybackYears={community.financials.average_payback_years}
            />
          </div>

          {/* Right Column - Participation & Contact */}
          <div className="space-y-6">
            {/* Participation Breakdown */}
            <ParticipationStatusCard
              totalParticipants={community.participant_count}
              interestedCount={community.interested_count}
              committedCount={community.committed_count}
              installedCount={community.installed_count}
            />

            {/* Coordinator Info */}
            {community.coordinator_name && community.coordinator_contact && (
              <CoordinatorCard
                coordinatorName={community.coordinator_name}
                coordinatorContact={community.coordinator_contact}
              />
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
        <JoinModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          communityId={communityId}
          communityName={community.name}
          isSubmitting={isSubmitting}
          joinSuccess={joinSuccess}
          formData={joinFormData}
          onInputChange={handleInputChange}
          onSubmit={handleJoinSubmit}
        />
      </main>
    </div>
  )
}
