import { NextRequest, NextResponse } from 'next/server'

// Backend API URL - adjust this to match your FastAPI server
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // Forward the request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: body.message,
        session_id: body.session_id || null,
        conversation_history: body.conversation_history || []
      })
    })

    // Check if the backend request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Backend request failed' 
      }))
      
      return NextResponse.json(
        { 
          error: errorData.error || 'Failed to get response from chatbot service',
          details: errorData
        },
        { status: response.status }
      )
    }

    // Parse and return the successful response
    const data = await response.json()
    
    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Handle different error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Cannot connect to backend service. Please check if the backend is running.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to check chatbot service status
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chatbot/health`, {
      method: 'GET',
    })

    if (!response.ok) {
      return NextResponse.json(
        { status: 'unhealthy', error: 'Backend service not responding' },
        { status: 503 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Cannot connect to backend' },
      { status: 503 }
    )
  }
}