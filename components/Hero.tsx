import React from "react"
import Link from "next/link"

export default function Hero(){
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-yellow-50/40">
      {/* Decorative background shapes - softer, more subtle */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-1/3 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-yellow-300/10 rounded-full blur-2xl"></div>
      
      <div className="container-max px-6 text-center relative z-10 max-w-4xl mx-auto">
        {/* Badge - Improved with animation */}
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-orange-200/50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium mb-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
          <svg className="w-3.5 h-3.5 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
          <span>Powered by AI & Satellite Data</span>
        </div>

        {/* Main Heading - Improved readability */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-5 text-gray-900 leading-tight max-w-3xl mx-auto">
          Find Your Rooftop's Solar Potential
        </h1>

        {/* Description - Better contrast and spacing */}
        <p className="max-w-2xl mx-auto text-gray-600 mb-8 text-sm sm:text-base leading-relaxed px-4">
          SolarMatch uses satellite imagery and open geodata to help you discover if your rooftop is ideal for solar panels. Get instant estimates on costs, savings, and join your neighbours to go solar together.
        </p>

        {/* CTA Button - Enhanced with better accessibility */}
        <div className="flex justify-center mb-10">
          <Link 
            href="/analyze" 
            className="group bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-semibold inline-flex items-center gap-2 text-sm transform focus:outline-none focus:ring-4 focus:ring-orange-300"
            aria-label="Check your rooftop's solar potential"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Check Your Solar Potential
          </Link>
        </div>
      </div>
    </section>
  )
}
