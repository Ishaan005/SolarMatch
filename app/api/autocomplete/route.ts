import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get('input')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!input) {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    console.log('Autocomplete request for:', input)
    
    // Use the NEW Places API (Text Search - Autocomplete)
    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify({
          input: input,
          includedPrimaryTypes: ['street_address', 'premise', 'subpremise']
          // No locationBias = worldwide coverage
        })
      }
    )

    const data = await response.json()
    console.log('Places API response:', JSON.stringify(data, null, 2))
    
    // Check for API errors
    if (data.error) {
      console.error('Places API Error:', data.error)
      console.error('Make sure "Places API (New)" is enabled:')
      console.error('https://console.cloud.google.com/marketplace/product/google/places-backend.googleapis.com')
      
      return NextResponse.json({
        status: 'REQUEST_DENIED',
        error_message: data.error.message || 'Places API error',
        predictions: []
      })
    }
    
    // Transform the new API response to match the old format
    if (data.suggestions && data.suggestions.length > 0) {
      const predictions = data.suggestions.map((suggestion: any) => ({
        place_id: suggestion.placePrediction?.placeId || '',
        description: suggestion.placePrediction?.text?.text || '',
        structured_formatting: {
          main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
          secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || ''
        }
      }))
      
      console.log('Returning', predictions.length, 'predictions')
      
      return NextResponse.json({
        status: 'OK',
        predictions: predictions
      })
    }
    
    console.log('No suggestions found')
    return NextResponse.json({ status: 'ZERO_RESULTS', predictions: [] })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json({ 
      status: 'ERROR',
      error: 'Autocomplete failed',
      predictions: []
    }, { status: 500 })
  }
}
