"""
Pipeline runner script for Sakha.
Ingests Gmail threads, cleans and chunks conversation messages,
embeds them locally, and populates ChromaDB.
"""

from backend.ingestion.gmail_pull import gmail_client
from backend.ingestion.chunker import chunk_conversation_thread
from backend.rag.vector_store import vector_store
from backend.data.demo_leads import get_demo_leads

def run_ingestion_pipeline():
    print("[Pipeline] Starting Sakha Email Ingestion & Indexing Pipeline...")
    
    # 1. Fetch threads
    leads = gmail_client.fetch_threads()
    print(f"[Pipeline] Fetched {len(leads)} lead threads.")
    
    all_chunks = []
    for lead in leads:
        chunks = chunk_conversation_thread(lead)
        all_chunks.extend(chunks)
        
    print(f"[Pipeline] Created {len(all_chunks)} searchable conversation chunks.")
    
    # 2. Store in ChromaDB
    vector_store.add_chunks(all_chunks)
    print("[Pipeline] Indexing into ChromaDB completed successfully.")
    
    return {
        "status": "success",
        "leads_processed": len(leads),
        "chunks_indexed": len(all_chunks)
    }

if __name__ == "__main__":
    result = run_ingestion_pipeline()
    print(f"[Pipeline] Result: {result}")
