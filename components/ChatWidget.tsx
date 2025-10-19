"use client"

import { useState, useEffect, useRef } from 'react'

// Types
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface PredefinedQuestion {
  id: string
  display_text: string
  category: string
}

// Simple markdown formatter for basic formatting
const formatMarkdown = (text: string): React.ReactElement[] => {
  const lines = text.split('\n')
  const elements: React.ReactElement[] = []
  
  lines.forEach((line, lineIndex) => {
    // Handle numbered lists with bold (e.g., "1. **Title:** description")
    const numberedListMatch = line.match(/^(\d+)\.\s+\*\*(.*?)\*\*:?\s*(.*)$/)
    if (numberedListMatch) {
      elements.push(
        <div key={lineIndex} className="mb-2 ml-4">
          <span className="font-semibold">{numberedListMatch[1]}. {numberedListMatch[2]}:</span>
          {numberedListMatch[3] && <span> {numberedListMatch[3]}</span>}
        </div>
      )
      return
    }
    
    // Handle bullet lists (e.g., "* Item" or "- Item")
    const bulletMatch = line.match(/^[\*\-]\s+(.+)$/)
    if (bulletMatch) {
      const content = bulletMatch[1]
      // Check if bullet item has bold text
      if (content.includes('**')) {
        const parts = content.split(/(\*\*.*?\*\*)/)
        elements.push(
          <div key={lineIndex} className="mb-1 ml-4 flex">
            <span className="mr-2">•</span>
            <span>
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>
                }
                return <span key={i}>{part}</span>
              })}
            </span>
          </div>
        )
      } else {
        elements.push(
          <div key={lineIndex} className="mb-1 ml-4 flex">
            <span className="mr-2">•</span>
            <span>{content}</span>
          </div>
        )
      }
      return
    }
    
    // Handle bold text (**text**) in regular paragraphs
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/)
      elements.push(
        <p key={lineIndex} className="mb-2">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>
            }
            return <span key={i}>{part}</span>
          })}
        </p>
      )
      return
    }
    
    // Handle empty lines
    if (line.trim() === '') {
      elements.push(<br key={lineIndex} />)
      return
    }
    
    // Regular text
    elements.push(<p key={lineIndex} className="mb-2">{line}</p>)
  })
  
  return elements
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [predefinedQuestions, setPredefinedQuestions] = useState<PredefinedQuestion[]>([])
  const [showPredefined, setShowPredefined] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load predefined questions on mount
  useEffect(() => {
    fetchPredefinedQuestions()
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const fetchPredefinedQuestions = async () => {
    try {
      const response = await fetch('/api/chatbot/questions')
      if (response.ok) {
        const data = await response.json()
        setPredefinedQuestions(data.questions || [])
      } else {
        console.warn('Failed to fetch questions, using defaults')
        // Set default questions if backend fails
        setPredefinedQuestions([
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
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch predefined questions:', error)
      // Set default questions on error
      setPredefinedQuestions([
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
        }
      ])
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowPredefined(false)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId,
          conversation_history: messages
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Update session ID
      if (data.session_id) {
        setSessionId(data.session_id)
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message with more details
      let errorText = 'Sorry, I encountered an error. '
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorText += 'Cannot connect to the chat service. Please make sure the backend is running.'
      } else if (error instanceof Error) {
        errorText += error.message
      } else {
        errorText += 'Please try again.'
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorText,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return
    sendMessage(inputValue)
  }

  const handlePredefinedClick = (question: PredefinedQuestion) => {
    sendMessage(question.display_text)
  }

  const clearChat = () => {
    setMessages([])
    setSessionId(null)
    setShowPredefined(true)
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M19 5l1.5-1.5M5 19l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Solar Assistant</h3>
                <p className="text-xs text-orange-100">Ask me anything about solar energy</p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && showPredefined && (
              <div className="space-y-4">
                <div className="text-center text-gray-600 text-sm mb-4">
                  <p className="font-medium mb-1">👋 Welcome to SolarMatch!</p>
                  <p>Ask me anything about solar panels, costs, grants, or click a question below:</p>
                </div>
                
                {/* Predefined Questions */}
                <div className="space-y-2">
                  {predefinedQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handlePredefinedClick(q)}
                      className="w-full text-left p-3 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg transition-all text-sm text-gray-700 hover:text-orange-700"
                    >
                      {q.display_text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed">
                      {formatMarkdown(msg.content)}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-gray-500 hover:text-orange-600 mb-2 flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear chat
              </button>
            )}
            
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder="Ask about solar panels..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={isLoading || !inputValue.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        aria-label="Toggle chat"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  )
}