import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GOOGLE_SOLAR_API_KEY: str = os.getenv("GOOGLE_SOLAR_API_KEY", "")
    GOOGLE_SOLAR_API_BASE_URL: str = "https://solar.googleapis.com/v1"
    
    @property
    def is_api_key_configured(self) -> bool:
        return bool(self.GOOGLE_SOLAR_API_KEY and self.GOOGLE_SOLAR_API_KEY != "YOUR_API_KEY")


settings = Settings()
