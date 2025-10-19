"""
Gemini API client wrapper with error handling and retries
"""
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import List, Dict, Optional
import logging

from .config import ChatbotConfig
from .models import Message

logger = logging.getLogger(__name__)


class GeminiClient:
    """Wrapper for Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini client"""
        self.config = ChatbotConfig
        
        # Configure Gemini API
        genai.configure(api_key=self.config.GEMINI_API_KEY)
        
        # Initialize model
        self.model = genai.GenerativeModel(
            model_name=self.config.GEMINI_MODEL,
            system_instruction=self.config.SYSTEM_PROMPT
        )
        
        # Generation config
        self.generation_config = genai.GenerationConfig(
            temperature=self.config.TEMPERATURE,
            max_output_tokens=self.config.MAX_OUTPUT_TOKENS,
        )
        
        logger.info(f"Gemini client initialized with model: {self.config.GEMINI_MODEL}")
    
    def _format_conversation_history(self, history: List[Message]) -> List[Dict[str, str]]:
        """
        Convert Message objects to Gemini format
        
        Args:
            history: List of Message objects
            
        Returns:
            List of dicts with 'role' and 'parts' keys
        """
        formatted_history = []
        
        for msg in history:
            # Gemini uses 'user' and 'model' as roles
            role = 'user' if msg.role == 'user' else 'model'
            formatted_history.append({
                'role': role,
                'parts': [msg.content]
            })
        
        return formatted_history
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def generate_response(
        self, 
        message: str, 
        conversation_history: Optional[List[Message]] = None
    ) -> str:
        """
        Generate response from Gemini
        
        Args:
            message: User message
            conversation_history: Previous conversation messages
            
        Returns:
            Generated response text
            
        Raises:
            Exception: If API call fails after retries
        """
        try:
            # Start a chat session if we have history
            if conversation_history and len(conversation_history) > 0:
                # Format history for Gemini
                formatted_history = self._format_conversation_history(conversation_history)
                
                # Create chat with history
                chat = self.model.start_chat(history=formatted_history)
                
                # Send message
                response = chat.send_message(
                    message,
                    generation_config=self.generation_config
                )
            else:
                # No history, single message
                response = self.model.generate_content(
                    message,
                    generation_config=self.generation_config
                )
            
            # Extract text from response
            response_text = response.text
            
            logger.info(f"Successfully generated response (length: {len(response_text)} chars)")
            
            return response_text
            
        except Exception as e:
            logger.error(f"Error generating response from Gemini: {str(e)}")
            raise
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text (approximate)
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Approximate token count
        """
        try:
            result = self.model.count_tokens(text)
            return result.total_tokens
        except Exception as e:
            logger.warning(f"Could not count tokens: {str(e)}")
            # Rough approximation: 1 token ≈ 4 characters
            return len(text) // 4
    
    async def test_connection(self) -> bool:
        """
        Test if Gemini API is accessible
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            response = await self.generate_response("Hello, this is a test message.")
            return len(response) > 0
        except Exception as e:
            logger.error(f"Gemini API connection test failed: {str(e)}")
            return False