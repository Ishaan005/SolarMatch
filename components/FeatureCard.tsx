import React from "react"

export default function FeatureCard({title, children, icon, color}:{title:string, children:React.ReactNode, icon?:React.ReactNode, color?:string}){
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 w-full max-w-[260px] h-[220px] flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color ?? 'bg-blue-50'}`}>
          {icon ?? null}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-center mb-3">{title}</h3>
        <p className="text-sm text-gray-600 text-center">{children}</p>
      </div>
    </div>
  )
}
