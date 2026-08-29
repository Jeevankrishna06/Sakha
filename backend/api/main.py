"""
FastAPI Backend Application for Sakha — AI Sales Follow-Up Agent.
Provides REST API endpoints for prioritized prospects, lead details,
interactive RAG sales intelligence chat, draft creation, and sync operations.
"""

from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings
from backend.data.demo_leads import get_demo_leads, get_demo_lead_by_id
from backend.ingestion.gmail_pull import gmail_client
from backend.rag.retriever import rag_retriever
from backend.agent.analysis_chain import analysis_chain
from backend.ingestion.run_pipeline import run_ingestion_pipeline

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API connecting Gmail RAG pipeline with React Dashboard"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# ----------------- Routes -----------------

@app.on_event("startup")
async def startup_event():
    """Seed ChromaDB with demo data on startup."""
    try:
        run_ingestion_pipeline()
    except Exception as e:
        print(f"[API] Startup indexing notice: {e}")

@app.get("/health")
def health_check():
    """Returns application status, LLM engine, and Gmail connection state."""
    gmail_status = gmail_client.get_status()
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "gmail": gmail_status
    }

@app.get("/stats")
def get_dashboard_stats():
    """Returns aggregated executive dashboard metrics."""
    leads = get_demo_leads()
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
        "last_sync": "Just now"
    }

@app.get("/leads")
def list_leads(urgency_min: Optional[int] = None, search: Optional[str] = None):
    """
    Returns prioritized prospects sorted by urgency score.
    """
    leads = get_demo_leads()
    
    # Sort descending by urgency score
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

@app.get("/lead/{lead_id}")
def get_lead_details(lead_id: str):
    """Returns complete prospect profile, conversation thread, and AI recommendations."""
    lead = get_demo_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    # Re-evaluate dynamic signals
    signals = analysis_chain.calculate_deterministic_signals(lead)
    lead_copy = dict(lead)
    lead_copy["signals"] = {**lead.get("signals", {}), **signals}
    return lead_copy

@app.post("/draft/{lead_id}")
def create_gmail_draft_for_lead(lead_id: str, request: Optional[CreateDraftRequest] = None):
    """
    Creates a real or simulated Gmail draft for the prospect.
    """
    lead = get_demo_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    to_email = request.to_email if request else lead.get("email", "")
    subject = request.subject if request else lead.get("draft", {}).get("subject", "Following up")
    body_text = request.body_text if request else lead.get("draft", {}).get("body", "")
    
    result = gmail_client.create_draft(to_email=to_email, subject=subject, body_text=body_text)
    return result

@app.post("/draft/generate")
def generate_custom_draft(payload: GenerateDraftRequest):
    """
    Dynamically generates or regenerates a draft using specified tone and custom instructions.
    """
    lead = get_demo_lead_by_id(payload.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    draft = analysis_chain.generate_draft(
        lead_data=lead,
        tone=payload.tone or "Professional",
        custom_prompt=payload.custom_instructions
    )
    return draft

@app.post("/chat")
def query_sales_copilot(payload: ChatQueryRequest):
    """
    Answers sales inquiries using RAG retrieval over indexed conversation chunks.
    """
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    # 1. Retrieve context
    chunks = rag_retriever.query_inbox(query, top_k=4)
    # 2. Synthesize response
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

@app.post("/sync")
def trigger_inbox_sync():
    """Manually triggers Gmail ingestion and local re-indexing."""
    result = run_ingestion_pipeline()
    return {
        "status": "success",
        "message": "Inbox synced and re-indexed successfully into ChromaDB",
        "details": result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
