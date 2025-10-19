"""
Pydantic models for chatbot API
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class Message(BaseModel):
    """Single message in conversation"""
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    conversation_history: Optional[List[Message]] = Field(
        default=None, 
        description="Previous conversation messages"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "What solar grants are available in Ireland?",
                "session_id": "user-123-session",
                "conversation_history": []
            }
        }
    )


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="Assistant's response")
    session_id: str = Field(..., description="Session ID")
    conversation_history: List[Message] = Field(..., description="Updated conversation history")
    gemini_model: str = Field(..., description="Gemini model used")
    tokens_used: Optional[int] = Field(None, description="Approximate tokens used")
    
    model_config = ConfigDict(protected_namespaces=())


class PredefinedQuestion(BaseModel):
    """Predefined showcase question"""
    id: str = Field(..., description="Unique question ID")
    display_text: str = Field(..., description="Text shown to user")
    category: str = Field(..., description="Question category")


class PredefinedQuestionsResponse(BaseModel):
    """Response with list of predefined questions"""
    questions: List[PredefinedQuestion]


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    gemini_api_configured: bool
    model: str
    timestamp: datetime = Field(default_factory=datetime.now)