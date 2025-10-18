import React from "react"
export default function Hero(){
  return (
    <section className="py-20">
      <div className="container-max px-6 text-center">
      <h2 className="text-lg font-medium mb-4">Find Your Rooftop's Solar Potential</h2>
      <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300 mb-8">SolarMatch uses satellite imagery and open geodata to help you discover if your rooftop is ideal for solar panels. Get instant estimates on costs, savings, and join your neighbours to go solar together.</p>
      <button className="bg-amber-500 text-white px-6 py-3 rounded-full shadow-md">Check Your Rooftop</button>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-6 justify-items-center">
      </div>
      </div>
    </section>
  )
}
