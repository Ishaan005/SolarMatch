"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "../../../components/Header"
import { Suspense } from "react"

interface CreateCommunityFormData {
  name: string
  description: string
  county: string
  coordinatorName: string
  coordinatorContact: string
}

function CreateCoopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const address = searchParams.get('address') || ""
  
  const [formData, setFormData] = useState<CreateCommunityFormData>({
    name: "",
    description: "",
    county: "",
    coordinatorName: "",
    coordinatorContact: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Extract county from address
  useEffect(() => {
    if (address) {
      const parts = address.split(',')
      const countyPart = parts.find(part => part.trim().toLowerCase().startsWith('co.'))
      if (countyPart) {
        const county = countyPart.trim().replace(/^co\.\s*/i, '')
        setFormData((prev: CreateCommunityFormData) => ({ ...prev, county }))
      }
    }
  }, [address])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: CreateCommunityFormData) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      const requestBody = {
        name: formData.name,
        description: formData.description,
        latitude: parseFloat(lat || '0'),
        longitude: parseFloat(lng || '0'),
        address: address,
        county: formData.county,
        coordinator_name: formData.coordinatorName,
        coordinator_contact: formData.coordinatorContact
      }
      
      console.log('Sending request:', requestBody)
      
      const response = await fetch(`${backendUrl}/api/coops/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Backend error:', errorData)
        throw new Error(JSON.stringify(errorData.detail) || 'Failed to create community')
      }
      
      const data = await response.json()
      
      // Redirect to the new community page
      router.push(`/coops/${data.community_id || data.coop_id}`)
      
    } catch (err) {
      console.error('Error creating community:', err)
      setError(err instanceof Error ? err.message : 'Failed to create community')
      setIsSubmitting(false)
    }
  }

  const canProceedStep1 = formData.name && formData.name.length >= 5 && formData.description && formData.description.length >= 20 && formData.county
  const canSubmit = canProceedStep1 && formData.coordinatorName && formData.coordinatorContact

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Co-ops</span>
          </button>
          
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Create Community Solar Project
          </h1>
          <p className="text-gray-600">
            Coordinate solar installation with neighbours at {address}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Tell us about your solar co-op project
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name * <span className="text-xs text-gray-500">(minimum 5 characters)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Ballyduff Community Solar"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description * <span className="text-xs text-gray-500">(minimum 20 characters)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your solar project, its goals, and how it will benefit the community..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/20 characters minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  placeholder="e.g., Waterford"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={address}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Coordinator Info
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Coordinator Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Coordinator Information</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Your contact details as the community coordinator
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="coordinatorName"
                  value={formData.coordinatorName}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="coordinatorContact"
                  value={formData.coordinatorContact}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Neighbours will use this to contact you about joining the community project
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-amber-900 font-medium mb-1">
                      What happens next?
                    </p>
                    <p className="text-sm text-amber-800">
                      We'll create your community coordination page. You can then share the link with 
                      neighbours to start gathering interest and coordinate bulk solar installation for better pricing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-900 px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Community...
                    </>
                  ) : (
                    'Create Community'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            How Community Solar Coordination Works
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Coordinate Together:</strong> Neighbours express interest and share solar potential data</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Bulk Discounts:</strong> Groups of 10+ homes get 25-40% off installation costs</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Individual Ownership:</strong> Each home owns their own system — no legal shares or co-ownership</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default function CreateCoopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreateCoopContent />
    </Suspense>
  )
}
