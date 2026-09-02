"""
Active Leads Store for Sakha.
Holds analyzed leads with multi-user isolation and disk persistence so that
each user's real synced Gmail threads are isolated.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.data.demo_leads import get_demo_leads
from backend.data.user_manager import get_user_workspace_dir

GLOBAL_CACHE_FILE = Path(__file__).resolve().parent / "synced_leads_cache.json"

# In-memory per-user store: { user_email: [leads] }
_USER_LEADS_STORE: Dict[str, List[Dict[str, Any]]] = {}


def _get_user_cache_path(user_email: Optional[str]) -> Path:
    """Returns the cache file path for a user."""
    if not user_email or user_email.lower() == "demo@sakha.ai":
        return GLOBAL_CACHE_FILE
    user_dir = get_user_workspace_dir(user_email)
    return user_dir / "synced_leads.json"


def initialize_leads_store(user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    """Loads leads for a specific user from their workspace cache or demo fallback."""
    key = user_email.strip().lower() if user_email else "default"
    cache_path = _get_user_cache_path(user_email)

    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data and isinstance(data, list) and len(data) > 0:
                    _USER_LEADS_STORE[key] = data
                    print(f"[LeadsStore] Loaded {len(data)} cached leads for user '{key}'.")
                    return _USER_LEADS_STORE[key]
        except Exception as e:
            print(f"[LeadsStore] Could not load cache for '{key}': {e}")

    # Fallback to global cache if user cache not present
    if GLOBAL_CACHE_FILE.exists():
        try:
            with open(GLOBAL_CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data and isinstance(data, list) and len(data) > 0:
                    _USER_LEADS_STORE[key] = data
                    return _USER_LEADS_STORE[key]
        except Exception:
            pass

    _USER_LEADS_STORE[key] = get_demo_leads()
    return _USER_LEADS_STORE[key]


def get_all_leads(user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns all leads for the specified user."""
    key = user_email.strip().lower() if user_email else "default"
    if key not in _USER_LEADS_STORE or not _USER_LEADS_STORE[key]:
        return initialize_leads_store(user_email)
    return _USER_LEADS_STORE[key]


def get_lead_by_id(lead_id: str, user_email: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Finds a specific lead for the user."""
    leads = get_all_leads(user_email)
    for l in leads:
        if str(l.get("id")) == str(lead_id):
            return l
    for l in get_demo_leads():
        if str(l.get("id")) == str(lead_id):
            return l
    return None


def set_current_leads(leads: List[Dict[str, Any]], user_email: Optional[str] = None) -> None:
    """Saves leads to the user's isolated workspace cache."""
    key = user_email.strip().lower() if user_email else "default"
    _USER_LEADS_STORE[key] = leads
    cache_path = _get_user_cache_path(user_email)
    try:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(leads, f, indent=2, ensure_ascii=False)
        print(f"[LeadsStore] Persisted {len(leads)} leads for user '{key}' to {cache_path.name}.")
    except Exception as e:
        print(f"[LeadsStore] Failed to persist leads for '{key}': {e}")


def update_lead_draft(lead_id: str, draft: Dict[str, Any], user_email: Optional[str] = None) -> bool:
    """Updates follow-up draft for a lead belonging to the user."""
    leads = get_all_leads(user_email)
    for l in leads:
        if str(l.get("id")) == str(lead_id):
            l["draft"] = draft
            set_current_leads(leads, user_email)
            return True
    return False
