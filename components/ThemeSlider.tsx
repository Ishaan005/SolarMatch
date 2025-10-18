"use client"

import React, { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"

export default function ThemeSlider() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isDragging, setIsDragging] = useState(false)
  const [mounted, setMounted] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position based on theme (0 = dark/left, 1 = light/right)
  const getPosition = () => {
    if (!mounted) return 0.5
    const currentTheme = theme === "system" ? resolvedTheme : theme
    return currentTheme === "dark" ? 0 : 1
  }

  const position = getPosition()

  const handleInteractionStart = (clientX: number) => {
    setIsDragging(true)
    updateThemeFromPosition(clientX)
  }

  const handleInteractionMove = (clientX: number) => {
    if (isDragging) {
      updateThemeFromPosition(clientX)
    }
  }

  const handleInteractionEnd = () => {
    setIsDragging(false)
  }

  const updateThemeFromPosition = (clientX: number) => {
    if (!trackRef.current) return
    
    const rect = trackRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    
    // Switch theme based on which half of slider
    const newTheme = percentage < 0.5 ? "dark" : "light"
    setTheme(newTheme)
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteractionStart(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleInteractionMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleInteractionEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleInteractionStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      handleInteractionMove(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    handleInteractionEnd()
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleTouchEnd)
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging])

  if (!mounted) {
    return (
      <div className="flex items-center gap-4 px-4 py-6">
        <div className="w-6 h-6 text-gray-400">🌙</div>
        <div className="relative w-full max-w-md h-2 bg-gray-200 rounded-full" />
        <div className="w-6 h-6 text-gray-400">☀️</div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 px-4 py-6" ref={sliderRef}>
      {/* Moon icon */}
      <div className="w-6 h-6 text-gray-500">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </div>

      {/* Slider track */}
      <div 
        ref={trackRef}
        className="relative w-full max-w-md h-2 rounded-full overflow-visible"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #10b981, #fbbf24)'
        }}
      >
        {/* Draggable handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform ${
            isDragging ? 'scale-110 cursor-grabbing' : 'cursor-grab hover:scale-105'
          }`}
          style={{
            left: `calc(${position * 100}% - 24px)`,
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Sun icon in handle */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" fill="white"/>
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6.34 6.34l-1.42-1.42M19.08 19.08l-1.42-1.42M6.34 17.66l-1.42 1.42M19.08 4.92l-1.42 1.42" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Sun icon */}
      <div className="w-6 h-6 text-amber-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6.34 6.34l-1.42-1.42M19.08 19.08l-1.42-1.42M6.34 17.66l-1.42 1.42M19.08 4.92l-1.42 1.42" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
