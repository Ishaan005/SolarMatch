import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Google Solar API settings
    GOOGLE_SOLAR_API_KEY: str = os.getenv("GOOGLE_SOLAR_API_KEY", "")
    GOOGLE_SOLAR_API_BASE_URL: str = "https://solar.googleapis.com/v1"
    
    # Database settings for Cloud SQL PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # SQL Echo (log queries in development)
    SQL_ECHO: bool = os.getenv("SQL_ECHO", "False").lower() == "true"
    
    @property
    def is_api_key_configured(self) -> bool:
        return bool(self.GOOGLE_SOLAR_API_KEY and self.GOOGLE_SOLAR_API_KEY != "YOUR_API_KEY")
    
    @property
    def is_database_configured(self) -> bool:
        return bool(self.DATABASE_URL)


settings = Settings()
