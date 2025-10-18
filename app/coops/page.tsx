"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"

export default function CoopsPage() {
  const router = useRouter()
  // Placeholder data - will be replaced with backend data
  const [location] = useState("Dublin")
  
  const coops = [
    {
      id: 1,
      name: "Amsterdam Central Solar Circle",
      members: 12,
      distance: 0.3,
      costReduction: 38,
      status: "Accepting Members"
    },
    {
      id: 2,
      name: "Neighbourhood Energy Collective",
      members: 8,
      distance: 0.5,
      costReduction: 42,
      status: "Accepting Members"
    },
    {
      id: 3,
      name: "Green Rooftops Initiative",
      members: 15,
      distance: 0.8,
      costReduction: 35,
      status: "Full"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Neighbourhood Solar Co-ops
        </h1>
        <p className="text-gray-600 mb-10">Co-ops near {location}</p>

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
          Existing Co-ops in Your Area
        </h2>

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

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{coop.members} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{coop.distance} km away</span>
                      </div>
                    </div>

                    {/* Cost reduction */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Average {coop.costReduction}% cost reduction</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Status and Button */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    coop.status === "Full" 
                      ? "bg-gray-200 text-gray-700" 
                      : "bg-green-100 text-green-700"
                  }`}>
                    {coop.status}
                  </span>
                  <button 
                    className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={coop.status === "Full"}
                  >
                    Request to Join
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
          <button className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-medium border-2 border-gray-300 transition-colors">
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
