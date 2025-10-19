import React from "react"

export default function FeatureCard({title, children, icon, color}:{title:string, children:React.ReactNode, icon?:React.ReactNode, color?:string}){
  return (
    <article 
      className={`group rounded-2xl p-8 w-full max-w-[320px] min-h-[260px] flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-3 cursor-pointer border-2 border-gray-100 hover:border-white bg-white backdrop-blur-sm ${color ?? 'bg-blue-50'}`}
      tabIndex={0}
      role="article"
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
          {icon ?? null}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-center mb-3 text-lg text-gray-900 transition-colors group-hover:text-gray-800">
          {title}
        </h3>
        <p className="text-sm text-gray-600 text-center leading-relaxed transition-colors group-hover:text-gray-700">
          {children}
        </p>
      </div>
      
      {/* Decorative bottom accent */}
      <div className="mt-6 pt-4 border-t border-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-center text-xs text-gray-500 gap-1">
          <span>Learn more</span>
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </article>
  )
}
