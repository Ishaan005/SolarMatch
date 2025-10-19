import React from "react"

export default function FeatureCard({title, children, icon, color}:{title:string, children:React.ReactNode, icon?:React.ReactNode, color?:string}){
  return (
    <div className={`rounded-3xl p-8 shadow-sm w-full max-w-[320px] min-h-[240px] flex flex-col transition-all hover:shadow-md hover:-translate-y-1 ${color ?? 'bg-blue-50'}`}>
      <div className="flex justify-center mb-6">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-sm`}>
          {icon ?? null}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-semibold text-center mb-3 text-base text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 text-center leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
