import { NextRequest, NextResponse } from 'next/server'

// Backend API URL - should match your FastAPI server
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Fetch predefined questions from FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/chatbot/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      console.error(`Backend returned status: ${response.status}`)
      
      // Return fallback questions if backend is down
      return NextResponse.json({
        questions: [
          {
            id: 'solar_grants',
            display_text: 'What solar grants are available in Ireland?',
            category: 'grants'
          },
          {
            id: 'installation_cost',
            display_text: 'How much does solar panel installation cost?',
            category: 'costs'
          },
          {
            id: 'roi_calculation',
            display_text: "What's the payback period for solar panels?",
            category: 'roi'
          },
          {
            id: 'seai_overview',
            display_text: 'What is SEAI and what do they do?',
            category: 'general'
          },
          {
            id: 'solar_benefits',
            display_text: 'What are the benefits of installing solar panels?',
            category: 'general'
          }
        ]
      }, { status: 200 })
    }

    const data = await response.json()
    
    // Return the questions from backend
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    })

  } catch (error) {
    console.error('Questions API error:', error)
    
    // Return fallback questions on any error
    return NextResponse.json({
      questions: [
        {
          id: 'solar_grants',
          display_text: 'What solar grants are available in Ireland?',
          category: 'grants'
        },
        {
          id: 'installation_cost',
          display_text: 'How much does solar panel installation cost?',
          category: 'costs'
        },
        {
          id: 'roi_calculation',
          display_text: "What's the payback period for solar panels?",
          category: 'roi'
        },
        {
          id: 'seai_overview',
          display_text: 'What is SEAI and what do they do?',
          category: 'general'
        },
        {
          id: 'solar_benefits',
          display_text: 'What are the benefits of installing solar panels?',
          category: 'general'
        }
      ]
    }, { status: 200 })
  }
}