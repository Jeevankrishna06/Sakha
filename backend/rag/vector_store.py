"""
Vector database manager using ChromaDB.
Stores email conversation chunks with metadata and provides similarity search.
"""

import os
from typing import List, Dict, Any, Optional
from backend.config import settings
from backend.rag.embed import local_embedder

class VectorStore:
    def __init__(self):
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
            self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
            self.collection = self.client.get_or_create_collection(
                name="sakha_sales_emails",
                metadata={"hnsw:space": "cosine"}
            )
            print("[VectorStore] ChromaDB initialized successfully.")
        except Exception as e:
            print(f"[VectorStore] ChromaDB persistent client fallback: {e}. Using in-memory index.")
            self.client = None
            self.collection = None
            self._in_memory_docs: List[Dict[str, Any]] = []

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """Indexes conversation chunks into ChromaDB."""
        if not chunks:
            return
            
        ids = [c["id"] for c in chunks]
        texts = [c["text"] for c in chunks]
        metadatas = [c.get("metadata", {}) for c in chunks]
        
        # Flatten complex metadata fields for ChromaDB compatibility
        clean_metadatas = []
        for m in metadatas:
            clean_m = {}
            for k, v in m.items():
                if isinstance(v, (str, int, float, bool)):
                    clean_m[k] = v
                else:
                    clean_m[k] = str(v)
            clean_metadatas.append(clean_m)
            
        embeddings = local_embedder.embed_texts(texts)
        
        if self.collection is not None:
            try:
                self.collection.upsert(
                    ids=ids,
                    documents=texts,
                    metadatas=clean_metadatas,
                    embeddings=embeddings
                )
                return
            except Exception as e:
                print(f"[VectorStore] Error upserting to ChromaDB: {e}")
                
        # In-memory store fallback
        if not hasattr(self, "_in_memory_docs"):
            self._in_memory_docs = []
        for i, t, m, emb in zip(ids, texts, clean_metadatas, embeddings):
            self._in_memory_docs.append({"id": i, "text": t, "metadata": m, "embedding": emb})

    def search(self, query: str, top_k: int = 4, filter_metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Performs semantic search over indexed email conversations."""
        query_emb = local_embedder.embed_query(query)
        
        if self.collection is not None:
            try:
                kwargs = {
                    "query_embeddings": [query_emb],
                    "n_results": top_k
                }
                if filter_metadata:
                    kwargs["where"] = filter_metadata
                    
                results = self.collection.query(**kwargs)
                formatted = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
                    ids = results["ids"][0] if "ids" in results else [""] * len(docs)
                    distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)
                    
                    for doc, meta, doc_id, dist in zip(docs, metas, ids, distances):
                        formatted.append({
                            "id": doc_id,
                            "text": doc,
                            "metadata": meta,
                            "score": round(1.0 - float(dist), 3) if dist is not None else 1.0
                        })
                return formatted
            except Exception as e:
                print(f"[VectorStore] Search query error: {e}")

        # In-memory cosine search fallback
        if hasattr(self, "_in_memory_docs") and self._in_memory_docs:
            scored = []
            import numpy as np
            q_vec = np.array(query_emb, dtype=np.float32)
            for doc in self._in_memory_docs:
                d_vec = np.array(doc["embedding"], dtype=np.float32)
                sim = float(np.dot(q_vec, d_vec))
                scored.append({
                    "id": doc["id"],
                    "text": doc["text"],
                    "metadata": doc["metadata"],
                    "score": round(sim, 3)
                })
            scored.sort(key=lambda x: x["score"], reverse=True)
            return scored[:top_k]
            
        return []

vector_store = VectorStore()
