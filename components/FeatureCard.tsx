import React from "react"

export default function FeatureCard({title, children, icon, color}:{title:string, children:React.ReactNode, icon?:React.ReactNode, color?:string}){
  return (
    <article 
      className={`rounded-3xl p-8 shadow-sm w-full max-w-[320px] min-h-[240px] flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer border border-transparent hover:border-white/60 ${color ?? 'bg-blue-50'}`}
      tabIndex={0}
      role="article"
    >
      <div className="flex justify-center mb-6">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center bg-white/60 backdrop-blur-sm shadow-sm transition-all duration-300 group-hover:scale-110`}>
          {icon ?? null}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-semibold text-center mb-3 text-base text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 text-center leading-relaxed">{children}</p>
      </div>
    </article>
  )
}
