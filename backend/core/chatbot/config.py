"""
Configuration for chatbot module
"""
import os
from dotenv import load_dotenv

load_dotenv()

class ChatbotConfig:
    """Configuration settings for the chatbot"""
    
    # Gemini API settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Updated to use Gemini 2.5 Flash (current stable model)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Temperature controls creativity (0.0-1.0)
    # Lower = more focused, Higher = more creative
    TEMPERATURE: float = float(os.getenv("CHATBOT_TEMPERATURE", "0.7"))
    
    # Max tokens in response
    MAX_OUTPUT_TOKENS: int = int(os.getenv("MAX_OUTPUT_TOKENS", "2048"))
    
    # Conversation history settings
    MAX_HISTORY_MESSAGES: int = int(os.getenv("MAX_HISTORY_MESSAGES", "10"))
    
    # System prompt
    SYSTEM_PROMPT: str = """You are a helpful assistant specializing in solar energy and sustainable energy solutions, particularly for Ireland.

Your expertise includes:
- Solar panel installation and costs
- SEAI (Sustainable Energy Authority of Ireland) grants and schemes
- Solar energy benefits and ROI calculations
- Renewable energy policies in Ireland
- Technical aspects of solar PV systems

Guidelines:
- Provide accurate, helpful information
- Be concise but thorough
- If you're unsure about specific current policies or prices, acknowledge it
- Focus on Irish context when relevant
- Be friendly and professional
"""

    @classmethod
    def validate(cls) -> bool:
        """Validate configuration"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set in environment variables")
        return True
    
    @classmethod
    def is_configured(cls) -> bool:
        """Check if chatbot is properly configured"""
        return bool(cls.GEMINI_API_KEY)


# Don't validate on import - allow backend to start without chatbot configured
# Validation will happen when chatbot is actually used