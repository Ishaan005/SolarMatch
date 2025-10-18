"use client"

import { useState, useEffect, useRef } from "react"
import Globe, { GlobeMethods } from "react-globe.gl"

interface GlobeProps {
  coordinates?: { lat: number; lng: number } | null
}

export default function GlobeComponent({ coordinates }: GlobeProps) {
  const globeEl = useRef<GlobeMethods | undefined>()
  const [globeReady, setGlobeReady] = useState(false)

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true
      globeEl.current.controls().autoRotateSpeed = 0.2
      globeEl.current.pointOfView({ lat: 30, lng: 0, altitude: 2.5 })
    }
  }, [globeReady])

  useEffect(() => {
    if (coordinates && globeEl.current) {
      globeEl.current.pointOfView(
        { lat: coordinates.lat, lng: coordinates.lng, altitude: 1.5 },
        1600
      )
      globeEl.current.controls().autoRotate = false
    }
  }, [coordinates])

  return (
    <div className="absolute inset-0 z-0">
      <Globe
        ref={globeEl}
        onGlobeReady={() => setGlobeReady(true)}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
        backgroundColor="rgba(0,0,0,0)"
        pointsData={coordinates ? [coordinates] : []}
        pointAltitude={0}
        pointRadius={0.5}
        pointColor={() => "#ef4444"}
        labelsData={coordinates ? [{ ...coordinates, text: "Location" }] : []}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => d.text}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={() => "rgba(255, 255, 255, 0.8)"}
        labelResolution={2}
      />
    </div>
  )
}
