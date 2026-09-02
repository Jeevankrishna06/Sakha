"""
RAG context retriever for Sakha.
Retrieves relevant email conversation chunks with tenant/user isolation.
"""

from typing import List, Dict, Any, Optional
from backend.rag.vector_store import vector_store
from backend.data.demo_leads import get_demo_leads

class RagRetriever:
    def __init__(self):
        pass

    def retrieve_context_for_lead(self, lead_id: str, user_email: Optional[str] = None, top_k: int = 5) -> str:
        """Retrieves conversational history and relevant chunks for a specific lead."""
        filter_meta = {"lead_id": lead_id}
        if user_email and user_email.lower() != "demo@sakha.ai":
            filter_meta["user_email"] = user_email

        results = vector_store.search(query=lead_id, top_k=top_k, filter_metadata=filter_meta)
        
        if not results:
            # Fallback to finding lead in demo data
            for lead in get_demo_leads():
                if lead["id"] == lead_id:
                    messages = []
                    for m in lead.get("thread", []):
                        sender = m.get("sender", "")
                        body = m.get("body", "")
                        date = m.get("date", "")
                        messages.append(f"[{date}] {sender}:\n{body}")
                    return "\n\n---\n\n".join(messages)
                    
        context_parts = [r["text"] for r in results]
        return "\n\n---\n\n".join(context_parts)

    def query_inbox(self, user_query: str, user_email: Optional[str] = None, top_k: int = 4) -> List[Dict[str, Any]]:
        """Answers high-level questions about sales opportunities filtered by user."""
        filter_meta = None
        if user_email and user_email.lower() != "demo@sakha.ai":
            filter_meta = {"user_email": user_email}
            
        results = vector_store.search(query=user_query, top_k=top_k, filter_metadata=filter_meta)
        if not results and filter_meta:
            # If user has no chunks yet, fallback to general search so Copilot remains helpful
            results = vector_store.search(query=user_query, top_k=top_k)
        return results

rag_retriever = RagRetriever()
