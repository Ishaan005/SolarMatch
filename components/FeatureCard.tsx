import React from "react"

export default function FeatureCard({title, children, icon, color}:{title:string, children:React.ReactNode, icon?:React.ReactNode, color?:string}){
  return (
    <article 
      className={`group rounded-xl p-6 w-full max-w-[280px] flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer border border-gray-200/50 hover:border-orange-200 bg-white backdrop-blur-sm ${color ?? 'bg-blue-50'}`}
      tabIndex={0}
      role="article"
    >
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
          {icon ?? null}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-center mb-2 text-base text-gray-900 transition-colors group-hover:text-orange-600">
          {title}
        </h3>
        <p className="text-xs text-gray-600 text-center leading-relaxed">
          {children}
        </p>
      </div>
    </article>
  )
}
