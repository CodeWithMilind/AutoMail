import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Auto Email AI Assistant"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./automail.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET")
    REDIRECT_URI: str = os.getenv("REDIRECT_URI", "http://localhost:8000/auth/callback")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama3-70b-8192")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")

settings = Settings()
