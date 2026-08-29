import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from root directory (auto-create from .env.example if missing)
BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / ".env"
env_example = BASE_DIR / ".env.example"

if not env_file.exists() and env_example.exists():
    import shutil
    try:
        shutil.copy(env_example, env_file)
        print("[Config] Created .env from .env.example template.")
    except Exception as e:
        print(f"[Config] Could not auto-create .env: {e}")

load_dotenv(env_file)

class Settings:
    PROJECT_NAME: str = "Sakha AI Sales Follow-Up Agent"
    VERSION: str = "1.0.0"
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq").lower()
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Gmail API Settings (OAuth)
    GMAIL_CREDENTIALS_PATH: str = os.getenv("GMAIL_CREDENTIALS_PATH", str(BASE_DIR / "credentials.json"))
    GMAIL_TOKEN_PATH: str = os.getenv("GMAIL_TOKEN_PATH", str(BASE_DIR / "token.json"))
    
    # Gmail IMAP Settings (App Password — simpler alternative to OAuth)
    GMAIL_EMAIL: str = os.getenv("GMAIL_EMAIL", "")
    GMAIL_APP_PASSWORD: str = os.getenv("GMAIL_APP_PASSWORD", "")
    
    # Vector Database & Embeddings
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", str(BASE_DIR / "chroma_db"))
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    
    # Server Settings
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "127.0.0.1")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", str(BASE_DIR / "app.log"))

settings = Settings()
