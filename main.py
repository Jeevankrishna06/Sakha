"""
Root entry point for Sakha FastAPI Backend.
Allows running `uvicorn main:app --reload` directly from the project root.
"""

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.api.main import app, settings

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
