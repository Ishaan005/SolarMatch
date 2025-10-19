"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header(){
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [isDark, setIsDark] = useState(false)

  // Load saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDarkMode = savedTheme === 'dark'
    setIsDark(isDarkMode)
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)'
    }
  }, [])

  const handleThemeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsDark(checked)
    
    // Save preference to localStorage
    localStorage.setItem('theme', checked ? 'dark' : 'light')
    
    if (checked) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.filter = ''
    }
  }

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200/50 z-20">
      <div className="container-max px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white shadow-sm"> 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M19 5l1.5-1.5M5 19l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="font-semibold text-xl text-orange-600">SolarMatch</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Dark/Light Mode Toggle */}
          {isHomePage && (
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isDark}
                  onChange={handleThemeToggle}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-orange-500 transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-6"></div>
              </label>
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          )}
          
          {!isHomePage && (
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back to Home</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
