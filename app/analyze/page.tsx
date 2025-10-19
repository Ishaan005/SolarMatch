"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Header from "../../components/Header"

// Dynamically import GlobeComponent with no SSR to avoid "window is not defined" error
const GlobeComponent = dynamic(() => import("./GlobeComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading globe...</p>
      </div>
    </div>
  )
})

const MapPinIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3b82f6"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

interface Suggestion {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export default function AnalyzePage() {
  const [address, setAddress] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [hasApiKey, setHasApiKey] = useState(true)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Check if API key is configured
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setHasApiKey(false)
    }
  }, [])

  // Fetch autocomplete suggestions via our API route
  const fetchAutocompleteSuggestions = async (input: string) => {
    if (!hasApiKey) return

    try {
      const response = await fetch(`/api/autocomplete?input=${encodeURIComponent(input)}`)
      const data = await response.json()
      
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions)
        setShowSuggestions(true)
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Google Places API error:', data.error_message)
        setHasApiKey(false)
        setSuggestions([])
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    }
  }

  // Handle address input change with debouncing
  const handleAddressChange = (value: string) => {
    setAddress(value)
    setSelectedCoordinates(null)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (value.length > 2 && hasApiKey) {
      debounceTimer.current = setTimeout(() => {
        fetchAutocompleteSuggestions(value)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Geocode address to get coordinates via our API route
  const geocodeAddress = async (selectedAddress: string): Promise<{lat: number, lng: number} | null> => {
    if (!hasApiKey) return null

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(selectedAddress)}`)
      const data = await response.json()
      
      if (data.status === 'OK' && data.results && data.results[0]) {
        const location = data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng
        }
      } else {
        console.error('Geocoding failed:', data.status)
        return null
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: Suggestion) => {
    setAddress(suggestion.description)
    setShowSuggestions(false)
    setSuggestions([])
    
    setIsLoading(true)
    const coordinates = await geocodeAddress(suggestion.description)
    setIsLoading(false)
    
    if (coordinates) {
      setSelectedCoordinates(coordinates)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address.trim()) {
      return
    }
    
    if (selectedCoordinates) {
      router.push(
        `/results?address=${encodeURIComponent(address)}&lat=${selectedCoordinates.lat}&lng=${selectedCoordinates.lng}`
      )
      return
    }
    
    if (hasApiKey) {
      setIsLoading(true)
      geocodeAddress(address).then((coordinates) => {
        setIsLoading(false)
        if (coordinates) {
          router.push(
            `/results?address=${encodeURIComponent(address)}&lat=${coordinates.lat}&lng=${coordinates.lng}`
          )
        } else {
          alert('Could not find coordinates for this address. Please try a more specific address.')
        }
      })
    } else {
      alert('Note: Without Google Maps API key, we cannot verify your address.')
      router.push(`/results?address=${encodeURIComponent(address)}`)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          {/* Left Column - Form */}
          <div className="space-y-8">
            <div className="flex justify-center lg:justify-start">
              <motion.div 
                className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <MapPinIcon />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Solar Potential
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Enter your address to analyze your location's solar energy potential using satellite imagery
              </p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label 
                  htmlFor="address" 
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Street Address
                </label>
                
                {!hasApiKey && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium mb-1">Address autocomplete is not available</p>
                        <p>Enable Places API in Google Cloud Console to use autocomplete</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={inputRef}>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Enter your street address"
                    className="w-full px-4 py-2.5 text-sm text-gray-900 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 bg-white hover:border-gray-300 placeholder:text-gray-500"
                    required
                    autoComplete="off"
                  />
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white backdrop-blur-sm border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                      {suggestions.map((prediction) => (
                        <button
                          key={prediction.place_id}
                          type="button"
                          onClick={() => handleSelectSuggestion(prediction)}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                        >
                          <svg 
                            className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                          </svg>
                          <div className="flex-1">
                            <div className="text-gray-900 font-medium">
                              {prediction.structured_formatting.main_text}
                            </div>
                            <div className="text-gray-500 text-xs mt-0.5">
                              {prediction.structured_formatting.secondary_text}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedCoordinates && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Location verified ({selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)})
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Getting location...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon />
                    <span>Analyze Solar Potential</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center lg:text-left text-gray-600 leading-relaxed">
                Your privacy matters. We only use your address to provide solar analysis.
              </p>
            </div>
          </motion.div>
        </div>
        {/* End Left Column */}

        {/* Right Column - Globe */}
        <motion.div 
          className="relative h-[450px] lg:h-[500px] flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlobeComponent coordinates={selectedCoordinates} />
          
          {/* Globe instruction text */}
          {!selectedCoordinates && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200">
              <p className="text-sm text-gray-700 font-medium">
                Enter an address to see your location
              </p>
            </div>
          )}
          
          {selectedCoordinates && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-xl">
              <p className="text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Location Found: {selectedCoordinates.lat.toFixed(4)}°, {selectedCoordinates.lng.toFixed(4)}°
              </p>
            </div>
          )}
        </motion.div>
        {/* End Right Column */}
        </div>
        {/* End Grid */}
      </main>
    </div>
  )
}
