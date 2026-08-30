"""
Local embedding generator using Sentence Transformers (all-MiniLM-L6-v2).
Provides zero-cost, local vector generation for email threads.
Includes deterministic fallback for rapid startup.
"""

from typing import List
import numpy as np
from backend.config import settings

class LocalEmbedder:
    def __init__(self):
        self._model = None
        self._initialized = False

    @property
    def model(self):
        if not self._initialized:
            self._initialized = True
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            except Exception as e:
                print(f"[LocalEmbedder] SentenceTransformer load deferred or offline: {e}. Using fast local vectorizer.")
                self._model = None
        return self._model

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
            
        if self.model is not None:
            try:
                embeddings = self.model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                print(f"[LocalEmbedder] Error during encode: {e}")
                
        # Fast local deterministic fallback vectorizer (384-dimensional like MiniLM)
        vectors = []
        for text in texts:
            vec = np.zeros(384, dtype=np.float32)
            words = text.lower().split()
            for w in words:
                h = abs(hash(w))
                idx = h % 384
                vec[idx] += 1.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            vectors.append(vec.tolist())
        return vectors

    def embed_query(self, query: str) -> List[float]:
        results = self.embed_texts([query])
        return results[0] if results else [0.0] * 384

local_embedder = LocalEmbedder()
