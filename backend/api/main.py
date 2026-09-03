"""
FastAPI Backend Application for Sakha — AI Sales Follow-Up Agent.
Provides unified REST API endpoints and full-stack integration with the React Dashboard.
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path regardless of execution directory
_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
_BACKEND = Path(__file__).resolve().parent.parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from typing import Optional, Dict, Any, List
import os
import time
import json
import asyncio
import threading
from fastapi import FastAPI, APIRouter, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import settings
from backend.data.leads_store import get_all_leads, get_lead_by_id, update_lead_draft
from backend.data.user_manager import get_all_users, get_user_by_email, register_or_update_user, delete_user
from backend.ingestion.gmail_pull import gmail_client, get_gmail_client, GmailClient
from backend.rag.retriever import rag_retriever
from backend.agent.analysis_chain import analysis_chain
from backend.ingestion.run_pipeline import run_ingestion_pipeline

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API and Integrated React UI for Sakha AI Sales Follow-Up Agent"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def get_request_user_email(request: Optional[Request] = None) -> Optional[str]:
    """Helper to extract user email from request headers or query params."""
    if not request:
        return None
    try:
        header_val = request.headers.get("X-User-Email") or request.headers.get("x-user-email")
        if header_val and header_val.strip():
            return header_val.strip()
        query_val = request.query_params.get("user_email")
        if query_val and query_val.strip():
            return query_val.strip()
    except Exception:
        pass
    return None

# Request Models
class GenerateDraftRequest(BaseModel):
    lead_id: str
    tone: Optional[str] = "Professional"
    custom_instructions: Optional[str] = None

class CreateDraftRequest(BaseModel):
    to_email: str
    subject: str
    body_text: str

class ChatQueryRequest(BaseModel):
    query: str

class GmailConnectRequest(BaseModel):
    email: str
    app_password: str

class PubSubMessage(BaseModel):
    data: Optional[str] = None
    messageId: Optional[str] = None
    publishTime: Optional[str] = None

class PubSubPushEnvelope(BaseModel):
    message: Optional[PubSubMessage] = None
    subscription: Optional[str] = None

# ----------------- Core API Router -----------------
api_router = APIRouter()

@api_router.post("/webhooks/gmail-pubsub")
def receive_gmail_pubsub_webhook(payload: PubSubPushEnvelope):
    """
    Receives real-time push webhook notifications from Google Cloud Pub/Sub.
    """
    import base64
    import json
    try:
        if payload.message and payload.message.data:
            decoded_bytes = base64.b64decode(payload.message.data)
            data = json.loads(decoded_bytes.decode('utf-8', errors='ignore'))
            print(f"[PubSub Webhook] Real-time Gmail event received: {data}")
        
        # Trigger immediate background sync & AI pipeline
        run_ingestion_pipeline()
        return {"status": "ok", "message": "Real-time sync triggered"}
    except Exception as e:
        print(f"[PubSub Webhook] Error processing push event: {e}")
        return {"status": "ok", "error": str(e)}

@api_router.post("/gmail/watch")
def start_gmail_pubsub_watch(request: Request, topic: Optional[str] = None):
    """Enables real-time push sync via Google Cloud Pub/Sub."""
    user_email = get_request_user_email(request)
    client = get_gmail_client(user_email)
    return client.start_watch(topic)

@api_router.post("/gmail/stop-watch")
def stop_gmail_pubsub_watch(request: Request):
    """Disables real-time push sync."""
    user_email = get_request_user_email(request)
    client = get_gmail_client(user_email)
    return client.stop_watch()

# ---------- Real-Time SSE Event Broadcasting ----------
# Thread-safe event broadcaster for pushing live updates to all connected frontend clients
_sse_clients: List[asyncio.Queue] = []
_sse_lock = threading.Lock()
_last_lead_hash: Optional[str] = None
_auto_sync_interval = 30  # seconds between background Gmail polls

def _compute_leads_hash(leads: list) -> str:
    """Quick fingerprint of current leads to detect changes."""
    return str(len(leads)) + "|" + "|".join(
        f"{l.get('id','')}:{l.get('subject','')[:20]}" for l in leads[:50]
    )

def _broadcast_event(event_type: str, data: dict):
    """Push an SSE event to all connected frontend clients."""
    with _sse_lock:
        dead = []
        for q in _sse_clients:
            try:
                q.put_nowait({"event": event_type, "data": data})
            except Exception:
                dead.append(q)
        for q in dead:
            _sse_clients.remove(q)

def _background_auto_sync():
    """Background thread that polls Gmail every N seconds and broadcasts changes."""
    global _last_lead_hash
    import time as _time
    _time.sleep(5)  # wait for startup
    while True:
        try:
            users = get_all_users()
            for u in users:
                user_email = u.get("email")
                if user_email:
                    run_ingestion_pipeline(user_email=user_email)
            leads = get_all_leads()
            new_hash = _compute_leads_hash(leads)
            if _last_lead_hash is not None and new_hash != _last_lead_hash:
                _broadcast_event("leads_updated", {
                    "total": len(leads),
                    "timestamp": _time.strftime("%H:%M:%S"),
                    "message": f"New emails detected! {len(leads)} leads updated."
                })
                print(f"[AutoSync] Change detected — pushed SSE update to {len(_sse_clients)} client(s)")
            _last_lead_hash = new_hash
        except Exception as e:
            print(f"[AutoSync] Background sync error: {e}")
        _time.sleep(_auto_sync_interval)

_sync_thread_started = False

def start_background_sync():
    global _sync_thread_started
    if not _sync_thread_started:
        _sync_thread = threading.Thread(target=_background_auto_sync, daemon=True)
        _sync_thread.start()
        _sync_thread_started = True

@api_router.get("/stream/leads")
async def stream_leads_sse(request: Request):
    """
    Server-Sent Events endpoint for real-time lead updates.
    Frontend connects once and receives instant push notifications
    whenever new emails arrive or leads change.
    """
    q = asyncio.Queue()
    with _sse_lock:
        _sse_clients.append(q)

    async def event_generator():
        try:
            # Send initial heartbeat
            yield f"event: connected\ndata: {json.dumps({'message': 'Live sync active', 'timestamp': time.strftime('%H:%M:%S')})}\n\n"
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"
                except asyncio.TimeoutError:
                    # Send keepalive heartbeat every 15s
                    yield f"event: heartbeat\ndata: {json.dumps({'ts': time.strftime('%H:%M:%S')})}\n\n"
        finally:
            with _sse_lock:
                if q in _sse_clients:
                    _sse_clients.remove(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

@api_router.get("/health")
def health_check(request: Request):
    """Returns application status, LLM engine, and Gmail connection state."""
    user_email = get_request_user_email(request)
    client = get_gmail_client(user_email)
    gmail_status = client.get_status()
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "gmail": gmail_status
    }

@api_router.get("/stats")
def get_dashboard_stats(request: Request):
    """Returns aggregated executive dashboard metrics for active user."""
    user_email = get_request_user_email(request)
    leads = get_all_leads(user_email=user_email)
    client = get_gmail_client(user_email)
    
    critical = sum(1 for l in leads if l.get("urgency", 0) >= 9)
    high = sum(1 for l in leads if 7 <= l.get("urgency", 0) <= 8)
    medium = sum(1 for l in leads if 4 <= l.get("urgency", 0) <= 6)
    low = sum(1 for l in leads if l.get("urgency", 0) < 4)
    awaiting_reply = sum(1 for l in leads if l.get("status") == "Awaiting Response")
    
    return {
        "total_leads": len(leads),
        "critical_count": critical,
        "high_priority_count": high,
        "medium_priority_count": medium,
        "low_priority_count": low,
        "awaiting_response_count": awaiting_reply,
        "due_today_count": critical + high,
        "last_sync": "Just now",
        "is_live_gmail": client.is_authenticated,
        "user_email": user_email or client.gmail_email
    }

@api_router.get("/leads")
def list_leads(request: Request, urgency_min: Optional[int] = None, search: Optional[str] = None):
    """Returns prioritized prospects sorted by urgency score for active user."""
    user_email = get_request_user_email(request)
    leads = get_all_leads(user_email=user_email)
    sorted_leads = sorted(leads, key=lambda x: x.get("urgency", 0), reverse=True)
    
    if urgency_min is not None:
        sorted_leads = [l for l in sorted_leads if l.get("urgency", 0) >= urgency_min]
        
    if search:
        s = search.lower()
        sorted_leads = [
            l for l in sorted_leads 
            if s in l.get("name", "").lower() or s in l.get("company", "").lower() or s in l.get("reason", "").lower()
        ]
        
    return sorted_leads

@api_router.get("/lead/{lead_id}")
def get_lead_details(lead_id: str, request: Request):
    """Returns complete prospect profile, conversation thread, and AI recommendations."""
    user_email = get_request_user_email(request)
    lead = get_lead_by_id(lead_id, user_email=user_email)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    signals = analysis_chain.calculate_deterministic_signals(lead)
    lead_copy = dict(lead)
    lead_copy["signals"] = {**lead.get("signals", {}), **signals}
    return lead_copy

@api_router.post("/draft/generate")
def generate_custom_draft(payload: GenerateDraftRequest, request: Request):
    """Dynamically generates or regenerates a draft using specified tone and custom instructions."""
    user_email = get_request_user_email(request)
    lead = get_lead_by_id(payload.lead_id, user_email=user_email)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    draft = analysis_chain.generate_draft(
        lead_data=lead,
        tone=payload.tone or "Professional",
        custom_prompt=payload.custom_instructions
    )
    update_lead_draft(payload.lead_id, draft, user_email=user_email)
    return draft

@api_router.post("/draft/{lead_id}")
def create_gmail_draft_for_lead(lead_id: str, request: Request, request_body: Optional[CreateDraftRequest] = None):
    """Creates a real or simulated Gmail draft for the prospect."""
    user_email = get_request_user_email(request)
    lead = get_lead_by_id(lead_id, user_email=user_email)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    to_email = request_body.to_email if request_body else lead.get("email", "")
    subject = request_body.subject if request_body else lead.get("draft", {}).get("subject", "Following up")
    body_text = request_body.body_text if request_body else lead.get("draft", {}).get("body", "")
    
    client = get_gmail_client(user_email)
    result = client.create_draft(to_email=to_email, subject=subject, body_text=body_text)
    return result

@api_router.post("/chat")
def query_sales_copilot(payload: ChatQueryRequest, request: Request):
    """Answers sales inquiries using RAG retrieval over user's indexed conversation chunks."""
    user_email = get_request_user_email(request)
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    chunks = rag_retriever.query_inbox(query, user_email=user_email, top_k=4)
    answer = analysis_chain.answer_rag_query(query, chunks)
    
    return {
        "query": query,
        "response": answer,
        "sources": [
            {
                "lead_name": c.get("metadata", {}).get("name", "Prospect"),
                "company": c.get("metadata", {}).get("company", ""),
                "date": c.get("metadata", {}).get("date", ""),
                "score": c.get("score", 0.9)
            }
            for c in chunks
        ]
    }

@api_router.post("/gmail/connect")
def connect_gmail(payload: GmailConnectRequest, request: Request):
    """Connects to Gmail via IMAP and triggers ingestion pipeline for this user."""
    email_addr = payload.email.strip()
    app_pw = payload.app_password.strip()

    if not email_addr or not app_pw:
        raise HTTPException(status_code=400, detail="Email and App Password are required")

    client = get_gmail_client(email_addr)
    result = client.configure_imap(email_addr, app_pw)
    if result.get("success"):
        try:
            pipeline_result = run_ingestion_pipeline(user_email=email_addr)
            result["pipeline"] = pipeline_result
            result["message"] = f"Connected as {email_addr}! Processed {pipeline_result.get('leads_processed', 0)} conversation threads."
        except Exception as e:
            print(f"[API] Post-connect ingestion notice: {e}")
            
    return result

@api_router.get("/gmail/status")
def gmail_status(request: Request):
    """Returns current Gmail connection status and auth mode for active user."""
    user_email = get_request_user_email(request)
    client = get_gmail_client(user_email)
    return client.get_status()

@api_router.get("/auth/users")
def list_accounts():
    """Returns list of all connected Google / email accounts."""
    return get_all_users()

@api_router.delete("/auth/user")
def remove_account(email: str):
    """Deletes an account from the local registry."""
    success = delete_user(email)
    return {"success": success, "email": email}

class GoogleAuthRequest(BaseModel):
    force_new: Optional[bool] = False

@api_router.post("/auth/google")
def google_auth(payload: Optional[GoogleAuthRequest] = None):
    """Trigger Google OAuth login via InstalledAppFlow to register or switch user."""
    force_new = payload.force_new if payload else False
    client = GmailClient()
    res = client.authenticate_interactive_oauth(force_new_account=force_new)
    if res.get("success"):
        email = res.get("email")
        try:
            run_ingestion_pipeline(user_email=email)
        except Exception as e:
            print(f"[API] Ingestion post-OAuth notice: {e}")
    return res

@api_router.get("/auth/status")
def auth_status(request: Request):
    """Returns current user authentication state."""
    user_email = get_request_user_email(request)
    client = get_gmail_client(user_email)
    user_info = get_user_by_email(user_email) if user_email else None
    status = client.get_status()
    if user_info:
        status["user"] = user_info
    return status

@api_router.post("/auth/logout")
def auth_logout(request: Request):
    """Logs out of current user session."""
    user_email = get_request_user_email(request)
    if user_email:
        client = get_gmail_client(user_email)
        client.is_authenticated = False
        client.auth_mode = "demo"
    return {"success": True, "message": "Logged out successfully"}

@api_router.post("/sync")
def trigger_inbox_sync(request: Request):
    """Manually triggers Gmail ingestion and local re-indexing for active user."""
    user_email = get_request_user_email(request)
    result = run_ingestion_pipeline(user_email=user_email)
    return {
        "status": "success",
        "message": f"Synced {result.get('leads_processed', 0)} conversation threads from {result.get('auth_mode', 'Gmail')}",
        "details": result
    }

# Include router on both root and /api prefixes so all paths are supported
app.include_router(api_router, prefix="")
app.include_router(api_router, prefix="/api")

# ----------------- Integrated Frontend Static Mounting -----------------
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Mount built assets
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend-assets")
    
    # Catch-all SPA route with no-cache headers to prevent asset mismatch errors
    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        # Allow API docs and OpenAPI schema through
        if full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path.startswith("redoc") or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        # If an asset (.js, .css, .map) is requested but does not exist in dist, return 404 rather than HTML
        if full_path.startswith("assets/") or full_path.endswith(".js") or full_path.endswith(".css") or full_path.endswith(".map"):
            target_file = FRONTEND_DIST / full_path
            if target_file.exists() and target_file.is_file():
                return FileResponse(str(target_file))
            raise HTTPException(status_code=404, detail="Asset not found")

        # Static files in dist root (like logo.jpeg, logo.png, favicon.ico)
        target_file = FRONTEND_DIST / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(str(target_file))
        
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(
                str(index_file),
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            )
        raise HTTPException(status_code=404, detail="Frontend build index.html not found")

@app.on_event("startup")
async def startup_event():
    """Seed ChromaDB with demo/cached data on startup."""
    try:
        run_ingestion_pipeline()
        start_background_sync()
    except Exception as e:
        print(f"[API] Startup indexing notice: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
