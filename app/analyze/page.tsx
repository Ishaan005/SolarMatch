"use client"

import { useState } from "react"
import Header from "../../components/Header"
import Link from "next/link"

const MapPinIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3b82f6"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export default function AnalyzePage() {
  const [address, setAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Analyzing address:", address)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-10">
            <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPinIcon />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-semibold text-center text-gray-900 mb-4">
            Enter Your Address
          </h1>

          {/* Subtitle */}
          <p className="text-base text-center text-gray-600 mb-12 max-w-xl mx-auto">
            We'll analyze your rooftop using satellite imagery to determine its solar potential
          </p>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm p-10 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Street Address Input */}
              <div>
                <label 
                  htmlFor="address" 
                  className="block text-base font-semibold text-gray-900 mb-3"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your street address:"
                  className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 bg-white hover:border-gray-600 placeholder:text-gray-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-lg font-medium text-base hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <SearchIcon />
                <span>Analyze My Rooftop</span>
              </button>
            </form>

            {/* Privacy Notice */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                Your privacy matters. We only use your address to provide solar analysis and don't share it with third parties.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
