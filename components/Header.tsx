"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header(){
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <header className="w-full bg-white border-b z-20">
      <div className="container-max px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-600 shadow-sm"> 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M19 5l1.5-1.5M5 19l-1.5 1.5" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="#c2410c" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="font-semibold text-xl text-gray-900">SolarMatch</span>
        </div>
        {!isHomePage && (
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back to Home</span>
          </Link>
        )}
      </div>
    </header>
  )
}
