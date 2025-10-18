import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )

    const data = await response.json()
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API Error:', data.error_message)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Geocoding request failed:', error)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
