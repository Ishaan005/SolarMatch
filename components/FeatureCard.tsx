import React from "react"

export default function FeatureCard({title, children, icon, color}:{title:string, children:React.ReactNode, icon?:React.ReactNode, color?:string}){
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-[280px] min-h-[240px] flex flex-col transition-shadow hover:shadow-md">
      <div className="flex justify-center mb-6">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color ?? 'bg-blue-50'}`}>
          {icon ?? null}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-semibold text-center mb-4 text-base">{title}</h3>
        <p className="text-sm text-gray-600 text-center leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
