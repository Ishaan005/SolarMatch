"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"

export default function FloatingHelp(){
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Context-aware help content based on current page
  const getHelpContent = () => {
    if (pathname === '/') {
      return {
        title: "Welcome to SolarMatch!",
        items: [
          { label: "Getting Started", text: "Click 'Check Your Solar Potential' to begin analyzing your rooftop." },
          { label: "What We Offer", text: "Satellite imagery analysis, cost estimates, and community solar options." },
          { label: "Free Analysis", text: "Get instant estimates with no commitment required." }
        ]
      }
    } else if (pathname === '/analyze') {
      return {
        title: "Analyzing Your Location",
        items: [
          { label: "Enter Address", text: "Type your full address for the most accurate results." },
          { label: "Use My Location", text: "Click the location icon to use your current GPS coordinates." },
          { label: "What's Next?", text: "After submission, we'll analyze satellite imagery of your rooftop." }
        ]
      }
    } else if (pathname === '/results') {
      return {
        title: "Understanding Your Results",
        items: [
          { label: "Satellite View", text: "Toggle between satellite imagery and solar flux heatmap." },
          { label: "Cost Estimates", text: "View installation costs, payback period, and annual savings." },
          { label: "Next Steps", text: "Download your report or explore solar co-ops in your area." }
        ]
      }
    } else if (pathname === '/coops') {
      return {
        title: "Solar Co-ops",
        items: [
          { label: "What are Co-ops?", text: "Groups of neighbors who install solar together for better rates." },
          { label: "Join a Co-op", text: "Browse local co-ops and connect with your community." },
          { label: "Benefits", text: "Lower costs through bulk purchasing and shared resources." }
        ]
      }
    }
    
    // Default help content
    return {
      title: "Need Help?",
      items: [
        { label: "Getting Started", text: "Enter your address to analyze your rooftop's solar potential." },
        { label: "Data Sources", text: "We use satellite imagery and AI to provide accurate estimates." },
        { label: "Questions?", text: "Contact our support team for assistance." }
      ]
    }
  }

  const helpContent = getHelpContent()

  return (
    <>
      {/* Help Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close help" : "Open help"}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-50 focus:outline-none focus:ring-4 focus:ring-orange-300"
      >
        <span className="text-lg font-bold">{isOpen ? "×" : "?"}</span>
      </button>

      {/* Help Popup */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-80 z-50 border border-gray-200 animate-fade-in"
          role="dialog"
          aria-labelledby="help-title"
        >
          <h3 id="help-title" className="text-lg font-bold text-gray-900 mb-3">{helpContent.title}</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {helpContent.items.map((item, index) => (
              <div key={index}>
                <p className="font-semibold text-gray-800">{item.label}:</p>
                <p>{item.text}</p>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Have questions? <span className="text-orange-600 hover:underline cursor-pointer font-medium">Contact support</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
