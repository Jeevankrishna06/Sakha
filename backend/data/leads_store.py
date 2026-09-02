"""
Active Leads Store for Sakha.
Holds analyzed leads with strict multi-user tenant isolation and disk persistence.
Real user workspaces never get polluted with hardcoded demo data.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.data.demo_leads import get_demo_leads
from backend.data.user_manager import get_user_workspace_dir

# In-memory per-user store: { user_email_clean: [leads] }
_USER_LEADS_STORE: Dict[str, List[Dict[str, Any]]] = {}


def _get_user_cache_path(user_email: Optional[str]) -> Optional[Path]:
    """Returns the dedicated synced_leads.json path for a user."""
    if not user_email:
        return None
    clean = user_email.strip().lower()
    if clean == "demo@sakha.ai" or clean == "demo":
        return None
    user_dir = get_user_workspace_dir(clean)
    return user_dir / "synced_leads.json"


def initialize_leads_store(user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    """Loads leads for a specific user from their isolated workspace cache."""
    clean = user_email.strip().lower() if user_email else "demo@sakha.ai"

    # 1. Pure demo user
    if clean == "demo@sakha.ai" or clean == "demo":
        demo = get_demo_leads()
        _USER_LEADS_STORE[clean] = demo
        return demo

    # 2. Real user account: check dedicated user cache
    cache_path = _get_user_cache_path(clean)
    if cache_path and cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    _USER_LEADS_STORE[clean] = data
                    print(f"[LeadsStore] Loaded {len(data)} cached leads for user '{clean}'.")
                    return data
        except Exception as e:
            print(f"[LeadsStore] Error reading cache for '{clean}': {e}")

    # 3. For new real users without a cache, return empty list (do NOT pollute with demo leads)
    _USER_LEADS_STORE[clean] = []
    return []


def get_all_leads(user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns all leads strictly belonging to the specified user."""
    clean = user_email.strip().lower() if user_email else "demo@sakha.ai"
    if clean not in _USER_LEADS_STORE:
        return initialize_leads_store(clean)
    return _USER_LEADS_STORE[clean]


def get_lead_by_id(lead_id: str, user_email: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Finds a specific lead in the user's workspace or fallback demo data."""
    leads = get_all_leads(user_email)
    for l in leads:
        if str(l.get("id")) == str(lead_id):
            return l
    clean = user_email.strip().lower() if user_email else "demo@sakha.ai"
    if clean == "demo@sakha.ai" or clean == "demo":
        for l in get_demo_leads():
            if str(l.get("id")) == str(lead_id):
                return l
    return None


def set_current_leads(leads: List[Dict[str, Any]], user_email: Optional[str] = None) -> None:
    """Saves leads strictly to the user's isolated workspace cache."""
    clean = user_email.strip().lower() if user_email else "demo@sakha.ai"
    _USER_LEADS_STORE[clean] = leads

    cache_path = _get_user_cache_path(clean)
    if cache_path:
        try:
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(leads, f, indent=2, ensure_ascii=False)
            print(f"[LeadsStore] Persisted {len(leads)} leads for user '{clean}' to {cache_path.name}.")
        except Exception as e:
            print(f"[LeadsStore] Failed to persist leads for '{clean}': {e}")


def update_lead_draft(lead_id: str, draft: Dict[str, Any], user_email: Optional[str] = None) -> bool:
    """Updates follow-up draft for a lead belonging to the user."""
    leads = get_all_leads(user_email)
    for l in leads:
        if str(l.get("id")) == str(lead_id):
            l["draft"] = draft
            set_current_leads(leads, user_email)
            return True
    return False
