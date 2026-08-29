"""
Active Leads Store for Sakha.
Holds analyzed leads in-memory with disk persistence so that real synced Gmail
threads and demo leads are seamlessly served to the API and UI.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.data.demo_leads import get_demo_leads

CACHE_FILE = Path(__file__).resolve().parent / "synced_leads_cache.json"

# In-memory store
_CURRENT_LEADS: List[Dict[str, Any]] = []

def initialize_leads_store() -> List[Dict[str, Any]]:
    global _CURRENT_LEADS
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data and isinstance(data, list) and len(data) > 0:
                    _CURRENT_LEADS = data
                    print(f"[LeadsStore] Loaded {len(_CURRENT_LEADS)} cached leads from disk.")
                    return _CURRENT_LEADS
        except Exception as e:
            print(f"[LeadsStore] Could not load cache: {e}")
    
    _CURRENT_LEADS = get_demo_leads()
    return _CURRENT_LEADS

def get_all_leads() -> List[Dict[str, Any]]:
    global _CURRENT_LEADS
    if not _CURRENT_LEADS:
        initialize_leads_store()
    return _CURRENT_LEADS

def get_lead_by_id(lead_id: str) -> Optional[Dict[str, Any]]:
    leads = get_all_leads()
    for l in leads:
        if str(l.get("id")) == str(lead_id):
            return l
    return None

def set_current_leads(leads: List[Dict[str, Any]]) -> None:
    global _CURRENT_LEADS
    _CURRENT_LEADS = leads
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(leads, f, indent=2, ensure_ascii=False)
        print(f"[LeadsStore] Persisted {len(leads)} leads to disk cache.")
    except Exception as e:
        print(f"[LeadsStore] Failed to persist leads cache: {e}")

def update_lead_draft(lead_id: str, draft: Dict[str, Any]) -> bool:
    leads = get_all_leads()
    for l in leads:
        if str(l.get("id")) == str(lead_id):
            l["draft"] = draft
            set_current_leads(leads)
            return True
    return False
