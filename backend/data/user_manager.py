"""
User Accounts & Session Manager for Sakha.
Manages multi-user registrations, profiles, per-user workspace directories,
and OAuth credentials storage.
"""

import os
import json
import re
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

DATA_DIR = Path(__file__).resolve().parent
USERS_DIR = DATA_DIR / "users"
REGISTRY_FILE = USERS_DIR / "users_registry.json"


def _safe_email_dir(email: str) -> str:
    """Converts email into a safe directory name."""
    if not email:
        return "default"
    # Replace non-alphanumeric chars (except dot, underscore, dash) with underscore
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", email.strip().lower())
    return safe


def get_user_workspace_dir(email: str) -> Path:
    """Returns the dedicated directory path for a user."""
    safe_dir = _safe_email_dir(email)
    user_dir = USERS_DIR / safe_dir
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


def _load_registry() -> List[Dict[str, Any]]:
    """Loads all registered users."""
    if not USERS_DIR.exists():
        USERS_DIR.mkdir(parents=True, exist_ok=True)
    if REGISTRY_FILE.exists():
        try:
            with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print(f"[UserManager] Could not read registry: {e}")
    return []


def _save_registry(users: List[Dict[str, Any]]) -> None:
    """Saves the user registry to disk."""
    if not USERS_DIR.exists():
        USERS_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[UserManager] Could not write registry: {e}")


def get_all_users() -> List[Dict[str, Any]]:
    """Returns all registered users with metadata."""
    users = _load_registry()
    if not users:
        # Check if existing token.json or env email exists to auto-register primary user
        from backend.config import settings
        primary_email = settings.GMAIL_EMAIL or "jeevankrishna675@gmail.com"
        token_path = Path(settings.GMAIL_TOKEN_PATH)
        if token_path.exists() and token_path.stat().st_size > 0:
            auto_user = {
                "email": primary_email,
                "name": settings.USER_NAME or "Jeevan Krishna",
                "auth_mode": "oauth",
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "last_active": time.strftime("%Y-%m-%d %H:%M:%S"),
                "is_primary": True
            }
            # Copy root token to user workspace
            u_dir = get_user_workspace_dir(primary_email)
            u_token = u_dir / "token.json"
            if not u_token.exists() and token_path.exists():
                try:
                    u_token.write_text(token_path.read_text(encoding="utf-8"), encoding="utf-8")
                except Exception:
                    pass
            users = [auto_user]
            _save_registry(users)
    return users


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Finds a registered user by email address."""
    if not email:
        return None
    email_clean = email.strip().lower()
    for u in get_all_users():
        if u.get("email", "").strip().lower() == email_clean:
            return u
    return None


def register_or_update_user(
    email: str,
    auth_mode: str = "oauth",
    name: str = "",
    picture: str = "",
    credentials_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Registers a new user or updates an existing user profile."""
    if not email:
        raise ValueError("User email is required for registration")
    
    email_clean = email.strip().lower()
    users = _load_registry()
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    user_entry = None
    for u in users:
        if u.get("email", "").strip().lower() == email_clean:
            user_entry = u
            break

    if user_entry:
        user_entry["auth_mode"] = auth_mode
        user_entry["last_active"] = now_str
        if name:
            user_entry["name"] = name
        if picture:
            user_entry["picture"] = picture
    else:
        user_entry = {
            "email": email_clean,
            "name": name or email_clean.split("@")[0].replace(".", " ").title(),
            "picture": picture,
            "auth_mode": auth_mode,
            "created_at": now_str,
            "last_active": now_str,
            "is_primary": len(users) == 0
        }
        users.append(user_entry)

    _save_registry(users)

    # Ensure user workspace exists and write profile.json
    u_dir = get_user_workspace_dir(email_clean)
    try:
        (u_dir / "profile.json").write_text(json.dumps(user_entry, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"[UserManager] Could not write profile.json: {e}")

    # If credentials/token dict is provided, save to user's token.json
    if credentials_data:
        try:
            (u_dir / "token.json").write_text(json.dumps(credentials_data, indent=2), encoding="utf-8")
        except Exception as e:
            print(f"[UserManager] Could not write token.json: {e}")

    print(f"[UserManager] Registered / updated user: {email_clean} ({auth_mode})")
    return user_entry


def get_user_token_path(email: str) -> Path:
    """Returns the path to the user's specific OAuth token file."""
    u_dir = get_user_workspace_dir(email)
    user_token = u_dir / "token.json"
    if user_token.exists() and user_token.stat().st_size > 0:
        return user_token
    # Fallback to root token.json if present
    from backend.config import settings
    root_token = Path(settings.GMAIL_TOKEN_PATH)
    if root_token.exists() and root_token.stat().st_size > 0:
        return root_token
    return user_token
