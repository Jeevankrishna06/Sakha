"""
Entry point for Sakha FastAPI Backend.
Allows running `uvicorn main:app --reload` directly from the `backend/` directory.
"""

import sys
from pathlib import Path

# Ensure project root and backend dir are in sys.path
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
_BACKEND = Path(__file__).resolve().parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from backend.api.main import app, settings

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
