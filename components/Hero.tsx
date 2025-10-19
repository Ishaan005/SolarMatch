import React from "react"
import Link from "next/link"

export default function Hero(){
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-yellow-50/40">
      {/* Decorative background shapes - softer, more subtle */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-yellow-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-1/3 w-64 h-64 bg-orange-200/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-amber-200/20 rounded-full blur-3xl"></div>
      
      <div className="container-max px-6 text-center relative z-10 max-w-5xl mx-auto">
        {/* Badge - Improved with animation */}
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-orange-200/50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium mb-4 shadow-sm hover:shadow-md transition-all duration-300">
          <svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
          <span>Powered by AI & Satellite Data</span>
        </div>

        {/* Main Heading - More compact */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight max-w-3xl mx-auto">
          Find Your Rooftop's Solar Potential
        </h1>

        {/* Description - More compact */}
        <p className="max-w-2xl mx-auto text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
          Get instant estimates on costs, savings, and solar potential using AI-powered satellite analysis. Join neighbors to go solar together.
        </p>

        {/* CTA Button with quick stats */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <Link 
            href="/analyze" 
            className="group bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-semibold inline-flex items-center gap-2 text-base transform focus:outline-none focus:ring-4 focus:ring-orange-300"
            aria-label="Check your rooftop's solar potential"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Check Your Solar Potential
          </Link>
          
          {/* Quick stats inline */}
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              100% Free
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              &lt;1 minute
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No sign-up
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
