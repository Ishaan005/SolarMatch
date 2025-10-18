import React from "react"
export default function Hero(){
  return (
    <section className="py-16 sm:py-20">
      <div className="container-max px-6 text-center">
        <h2 className="text-lg sm:text-xl font-medium mb-4 text-gray-900">Find Your Rooftop's Solar Potential</h2>
        <p className="max-w-3xl mx-auto text-gray-700 mb-8 text-sm sm:text-base leading-relaxed">SolarMatch uses satellite imagery and open geodata to help you discover if your rooftop is ideal for solar panels. Get instant estimates on costs, savings, and join your neighbours to go solar together.</p>
        <div className="flex justify-center">
          <button className="bg-amber-500 hover:bg-amber-600 transition-colors text-white px-8 py-3 rounded-full shadow-md font-medium">Check Your Rooftop</button>
        </div>
      </div>
    </section>
  )
}
