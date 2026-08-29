"""
Pipeline runner script for Sakha.
Ingests Gmail threads (real IMAP/OAuth or demo), runs AI analysis chain
(urgency score 1-10, buying signals, broken promises, tactical actions, draft follow-ups),
populates ChromaDB vector memory, and updates the active leads store.
"""

from typing import Dict, Any, List
from backend.ingestion.gmail_pull import gmail_client
from backend.ingestion.chunker import chunk_conversation_thread
from backend.rag.vector_store import vector_store
from backend.agent.analysis_chain import analysis_chain
from backend.data.leads_store import set_current_leads, get_all_leads

def run_ingestion_pipeline() -> Dict[str, Any]:
    print("[Pipeline] Starting Sakha Email Ingestion & Indexing Pipeline...")
    
    # 1. Fetch threads (from real Gmail if configured, else fallback demo data)
    raw_leads = gmail_client.fetch_threads(max_threads=30)
    print(f"[Pipeline] Fetched {len(raw_leads)} lead threads from {gmail_client.get_status().get('mode')}.")
    
    analyzed_leads = []
    all_chunks = []
    
    for lead in raw_leads:
        try:
            # 2. Calculate signals and run AI analysis chain on each lead
            signals = analysis_chain.calculate_deterministic_signals(lead)
            analysis = analysis_chain._heuristic_analysis(lead, signals, None, "Professional")
            
            analyzed_lead = dict(lead)
            analyzed_lead["urgency"] = analysis.get("urgency", lead.get("urgency", 5))
            analyzed_lead["urgency_level"] = analysis.get("urgency_level", "Medium")
            analyzed_lead["reason"] = analysis.get("reason", lead.get("reason", "Recent conversation activity detected."))
            analyzed_lead["next_action"] = analysis.get("next_action", lead.get("next_action", "Follow up with prospect."))
            analyzed_lead["signals"] = {**lead.get("signals", {}), **signals}
            
            # Enrich draft if not already personalized
            if not analyzed_lead.get("draft") or not analyzed_lead.get("draft", {}).get("body"):
                analyzed_lead["draft"] = {
                    "subject": analysis.get("draft_subject", f"Re: {lead.get('subject', 'Our Discussion')}"),
                    "body": analysis.get("draft_message", ""),
                    "tone": "Professional"
                }
            
            analyzed_leads.append(analyzed_lead)
            
            # 3. Create searchable chunks for RAG vector memory
            chunks = chunk_conversation_thread(analyzed_lead)
            all_chunks.extend(chunks)
        except Exception as e:
            print(f"[Pipeline] Warning: Could not analyze lead {lead.get('id')}: {e}")
            analyzed_leads.append(lead)
            
    # 4. Save analyzed leads into active leads store
    set_current_leads(analyzed_leads)
    print(f"[Pipeline] Stored {len(analyzed_leads)} analyzed leads in active memory.")
    
    # 5. Populate local vector store
    if all_chunks:
        vector_store.add_chunks(all_chunks)
        print(f"[Pipeline] Indexed {len(all_chunks)} conversation chunks into ChromaDB.")
        
    return {
        "status": "success",
        "auth_mode": gmail_client.get_status().get("mode"),
        "leads_processed": len(analyzed_leads),
        "chunks_indexed": len(all_chunks),
        "is_live_data": gmail_client.is_authenticated
    }

if __name__ == "__main__":
    result = run_ingestion_pipeline()
    print(f"[Pipeline] Result: {result}")
