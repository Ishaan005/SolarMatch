"""
Main chatbot service orchestrating the conversation flow
"""
import uuid
import logging
from typing import Dict, List, Optional
from datetime import datetime

from .gemini_client import GeminiClient
from .config import ChatbotConfig
from .models import ChatRequest, ChatResponse, Message, PredefinedQuestion, PredefinedQuestionsResponse

logger = logging.getLogger(__name__)


# Predefined showcase questions
PREDEFINED_QUESTIONS = [
    PredefinedQuestion(
        id="solar_grants",
        display_text="What solar grants are available in Ireland?",
        category="grants"
    ),
    PredefinedQuestion(
        id="installation_cost",
        display_text="How much does solar panel installation cost?",
        category="costs"
    ),
    PredefinedQuestion(
        id="roi_calculation",
        display_text="What's the payback period for solar panels?",
        category="roi"
    ),
    PredefinedQuestion(
        id="seai_overview",
        display_text="What is SEAI and what do they do?",
        category="general"
    ),
    PredefinedQuestion(
        id="solar_benefits",
        display_text="What are the benefits of installing solar panels?",
        category="general"
    )
]


class ChatbotService:
    """Main chatbot service"""
    
    def __init__(self):
        """Initialize chatbot service"""
        self.gemini_client: Optional[GeminiClient] = None
        self.config = ChatbotConfig
        
        # In-memory session storage (will be replaced with Redis later)
        self.sessions: Dict[str, List[Message]] = {}
        
        logger.info("ChatbotService initialized")
    
    async def initialize(self):
        """Initialize the service (call this on app startup)"""
        try:
            self.gemini_client = GeminiClient()
            
            # Test connection
            is_connected = await self.gemini_client.test_connection()
            
            if is_connected:
                logger.info("✅ Chatbot service initialized successfully")
            else:
                logger.warning("⚠️ Chatbot service initialized but Gemini API test failed")
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize chatbot service: {str(e)}")
            raise
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return f"session-{uuid.uuid4()}"
    
    def _get_or_create_session(self, session_id: Optional[str]) -> tuple[str, List[Message]]:
        """
        Get existing session or create new one
        
        Args:
            session_id: Optional session ID
            
        Returns:
            Tuple of (session_id, conversation_history)
        """
        if session_id and session_id in self.sessions:
            return session_id, self.sessions[session_id]
        else:
            new_session_id = self._generate_session_id()
            self.sessions[new_session_id] = []
            return new_session_id, []
    
    def _update_session_history(
        self, 
        session_id: str, 
        user_message: str, 
        assistant_response: str
    ) -> List[Message]:
        """
        Update session conversation history
        
        Args:
            session_id: Session ID
            user_message: User's message
            assistant_response: Assistant's response
            
        Returns:
            Updated conversation history
        """
        # Get existing history
        history = self.sessions.get(session_id, [])
        
        # Add new messages
        history.append(Message(role="user", content=user_message))
        history.append(Message(role="assistant", content=assistant_response))
        
        # Keep only last N messages to avoid context overflow
        max_messages = self.config.MAX_HISTORY_MESSAGES * 2  # *2 because user+assistant pairs
        if len(history) > max_messages:
            history = history[-max_messages:]
        
        # Update session
        self.sessions[session_id] = history
        
        return history
    
    async def handle_chat(self, request: ChatRequest) -> ChatResponse:
        """
        Handle chat request
        
        Args:
            request: ChatRequest object
            
        Returns:
            ChatResponse object
            
        Raises:
            Exception: If chat processing fails
        """
        try:
            # Get or create session
            session_id, history = self._get_or_create_session(request.session_id)
            
            # Use provided history if available, otherwise use session history
            conversation_history = request.conversation_history if request.conversation_history else history
            
            # Generate response from Gemini
            logger.info(f"Processing message for session {session_id}: '{request.message[:50]}...'")
            
            response_text = await self.gemini_client.generate_response(
                message=request.message,
                conversation_history=conversation_history
            )
            
            # Update session history
            updated_history = self._update_session_history(
                session_id=session_id,
                user_message=request.message,
                assistant_response=response_text
            )
            
            # Count tokens (approximate)
            total_tokens = (
                self.gemini_client.count_tokens(request.message) +
                self.gemini_client.count_tokens(response_text)
            )
            response = ChatResponse(
                response=response_text,
                session_id=session_id,
                conversation_history=updated_history,
                gemini_model=self.config.GEMINI_MODEL,  # Changed from model_used
                tokens_used=total_tokens
            )
            
            logger.info(f"✅ Successfully processed message for session {session_id}")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Error handling chat request: {str(e)}")
            raise
    
    def get_predefined_questions(self) -> PredefinedQuestionsResponse:
        """
        Get list of predefined showcase questions
        
        Returns:
            PredefinedQuestionsResponse with questions
        """
        return PredefinedQuestionsResponse(questions=PREDEFINED_QUESTIONS)
    
    def clear_session(self, session_id: str) -> bool:
        """
        Clear a session's conversation history
        
        Args:
            session_id: Session ID to clear
            
        Returns:
            True if session was cleared, False if session didn't exist
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Cleared session: {session_id}")
            return True
        return False
    
    async def health_check(self) -> Dict:
        """
        Check service health
        
        Returns:
            Health status dict
        """
        try:
            api_test = await self.gemini_client.test_connection() if self.gemini_client else False
            
            return {
                "status": "healthy" if api_test else "degraded",
                "gemini_api_configured": bool(self.config.GEMINI_API_KEY),
                "gemini_api_accessible": api_test,
                "model": self.config.GEMINI_MODEL,
                "active_sessions": len(self.sessions),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }