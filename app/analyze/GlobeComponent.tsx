"use client"

import { useState, useEffect, useRef } from "react"
import Globe, { GlobeMethods } from "react-globe.gl"

interface GlobeProps {
  coordinates?: { lat: number; lng: number } | null
}

export default function GlobeComponent({ coordinates }: GlobeProps) {
  const globeEl = useRef<GlobeMethods | undefined>(undefined)
  const [globeReady, setGlobeReady] = useState(false)

  // Initialize globe on mount
  useEffect(() => {
    if (globeEl.current && globeReady) {
      const controls = globeEl.current.controls()
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.5
      controls.enableZoom = false
      controls.enablePan = false
      controls.minDistance = 200
      controls.maxDistance = 400
      
      // Set initial view - slightly elevated and angled
      globeEl.current.pointOfView({ 
        lat: 20, 
        lng: 0, 
        altitude: 2.2 
      }, 0)
    }
  }, [globeReady])

  // Animate to coordinates when selected
  useEffect(() => {
    if (coordinates && globeEl.current && globeReady) {
      const controls = globeEl.current.controls()
      
      // Smoothly transition to the location
      globeEl.current.pointOfView(
        { 
          lat: coordinates.lat, 
          lng: coordinates.lng, 
          altitude: 1.8 
        },
        2000 // 2 second animation
      )
      
      // Stop rotation when location is selected
      controls.autoRotate = false
    }
  }, [coordinates, globeReady])

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Gradient overlay for better blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30 z-10 pointer-events-none" />
      
      {/* Globe - constrained size */}
      <div className="w-full h-full max-w-[450px] max-h-[450px]">
        <Globe
          ref={globeEl}
          onGlobeReady={() => setGlobeReady(true)}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          width={450}
          height={450}
          
          // Point marker
          pointsData={coordinates ? [coordinates] : []}
          pointAltitude={0.01}
          pointRadius={0.8}
          pointColor={() => "#ef4444"}
          pointLabel={() => ""}
          
          // Pulsing ring effect
          ringsData={coordinates ? [coordinates] : []}
          ringColor={() => "rgba(239, 68, 68, 0.6)"}
          ringMaxRadius={2}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1200}
          
          // Arc from center to location (subtle)
          arcsData={coordinates ? [{
            startLat: 0,
            startLng: 0,
            endLat: coordinates.lat,
            endLng: coordinates.lng,
            color: ['rgba(59, 130, 246, 0.3)', 'rgba(239, 68, 68, 0.8)']
          }] : []}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcStroke={0.5}
          
          // Atmosphere glow
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
          
          // Performance settings
          animateIn={false}
          waitForGlobeReady={true}
        />
      </div>
    </div>
  )
}
