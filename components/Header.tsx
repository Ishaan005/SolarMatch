"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200/60 z-20 sticky top-0 shadow-sm">
      <div className="container-max px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="SolarMatch Home">
          <div className="h-12 w-auto relative" style={{ mixBlendMode: 'darken' }}>
            <Image 
              src="/logo.png" 
              alt="SolarMatch Logo" 
              width={120} 
              height={120} 
              className="h-12 w-auto object-contain"
              style={{ 
                filter: 'brightness(1.2) contrast(1.1)',
                backgroundColor: 'transparent'
              }}
            />
          </div>
          <span className="font-bold text-xl text-orange-600 hidden sm:block">SolarMatch</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Platform Link */}
          <Link 
            href="/platform" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg active:scale-95 group"
            aria-label="Platform"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Platform</span>
          </Link>

          {/* Dark/Light Mode Toggle */}
          {isHomePage && (
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 shadow-inner" role="group" aria-label="Theme toggle">
              <svg className="w-5 h-5 text-orange-500 transition-transform hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <label className="relative inline-block w-12 h-6 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isDark}
                  onChange={handleThemeToggle}
                  className="sr-only peer"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                />
                <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-orange-500 transition-all duration-300 peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6 group-hover:scale-110"></div>
              </label>
              <svg className="w-4 h-4 text-gray-600 transition-transform hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          )}
          
          {!isHomePage && (
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-all text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-50 active:scale-95"
              aria-label="Back to home page"
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
