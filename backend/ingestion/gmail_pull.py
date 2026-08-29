"""
Gmail client for Sakha — supports two auth modes:
  1. IMAP with Email + App Password (simple, no Google Cloud project needed)
  2. OAuth 2.0 via Gmail API (full-featured, needs credentials.json)
Falls back gracefully to demo data when neither is configured.
"""

import os
import imaplib
import smtplib
import email
import email.utils
import base64
from email.mime.text import MIMEText
from email.header import decode_header
from typing import List, Dict, Any, Optional
from backend.config import settings
from backend.data.demo_leads import get_demo_leads


def _decode_header_value(val):
    """Decode an RFC 2047 encoded email header value."""
    if val is None:
        return ""
    parts = decode_header(val)
    result = []
    for data, charset in parts:
        if isinstance(data, bytes):
            result.append(data.decode(charset or "utf-8", errors="replace"))
        else:
            result.append(str(data))
    text = " ".join(result)
    # Sanitize unusual quotes and dashes
    text = text.replace('\u2011', '-').replace('\u2012', '-').replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
    return text


def _extract_body(msg):
    """Extract plain text body from an email.message.Message object."""
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            cd = str(part.get("Content-Disposition", ""))
            if ct == "text/plain" and "attachment" not in cd:
                payload = part.get_payload(decode=True)
                if payload:
                    return payload.decode("utf-8", errors="replace")
        # Fallback: try text/html
        for part in msg.walk():
            ct = part.get_content_type()
            if ct == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    import re
                    html = payload.decode("utf-8", errors="replace")
                    return re.sub(r"<[^>]+>", "", html).strip()
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            return payload.decode("utf-8", errors="replace")
    return ""


class GmailClient:
    def __init__(self):
        self.service = None          # Gmail API service (OAuth mode)
        self.is_authenticated = False
        self.auth_mode = "demo"      # 'imap', 'oauth', or 'demo'
        self.gmail_email = settings.GMAIL_EMAIL
        self.gmail_app_password = settings.GMAIL_APP_PASSWORD
        self._init_service()

    def _init_service(self):
        """Try IMAP first (simpler), then OAuth, then fall back to demo."""
        # ── 1. Try IMAP with App Password ──
        if self.gmail_email and self.gmail_app_password:
            try:
                imap = imaplib.IMAP4_SSL("imap.gmail.com")
                imap.login(self.gmail_email, self.gmail_app_password)
                imap.logout()
                self.is_authenticated = True
                self.auth_mode = "imap"
                print(f"[GmailClient] IMAP authenticated as {self.gmail_email}")
                return
            except Exception as e:
                print(f"[GmailClient] IMAP login failed: {e}")

        # ── 2. Try OAuth 2.0 via Gmail API ──
        creds_path = settings.GMAIL_CREDENTIALS_PATH
        token_path = settings.GMAIL_TOKEN_PATH

        if os.path.exists(token_path) or os.path.exists(creds_path):
            try:
                from google.oauth2.credentials import Credentials
                from google_auth_oauthlib.flow import InstalledAppFlow
                from google.auth.transport.requests import Request
                from googleapiclient.discovery import build

                SCOPES = [
                    'https://www.googleapis.com/auth/gmail.readonly',
                    'https://www.googleapis.com/auth/gmail.compose'
                ]

                creds = None
                if os.path.exists(token_path):
                    creds = Credentials.from_authorized_user_file(token_path, SCOPES)

                if not creds or not creds.valid:
                    if creds and creds.expired and creds.refresh_token:
                        creds.refresh(Request())
                    elif os.path.exists(creds_path):
                        flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
                        creds = flow.run_local_server(port=0)
                        with open(token_path, 'w') as token:
                            token.write(creds.to_json())

                if creds:
                    self.service = build('gmail', 'v1', credentials=creds)
                    self.is_authenticated = True
                    self.auth_mode = "oauth"
                    print("[GmailClient] OAuth2 Gmail API authenticated.")
                    return
            except Exception as e:
                print(f"[GmailClient] OAuth failed: {e}. Falling back to demo.")

        # ── 3. Demo mode ──
        self.is_authenticated = False
        self.auth_mode = "demo"

    def configure_imap(self, email_addr: str, app_password: str) -> Dict[str, Any]:
        """
        Dynamically configure IMAP credentials at runtime (called from the API).
        Returns success/failure status.
        """
        try:
            # Validate credentials by attempting IMAP login
            imap = imaplib.IMAP4_SSL("imap.gmail.com")
            imap.login(email_addr, app_password)
            imap.logout()

            # Save credentials in memory
            self.gmail_email = email_addr
            self.gmail_app_password = app_password
            self.is_authenticated = True
            self.auth_mode = "imap"

            # Also write to .env for persistence across restarts
            self._persist_credentials(email_addr, app_password)

            return {
                "success": True,
                "message": f"Gmail IMAP connected as {email_addr}",
                "mode": "imap"
            }
        except imaplib.IMAP4.error as e:
            return {
                "success": False,
                "message": f"Gmail login failed: {str(e)}. Make sure you're using an App Password (not your regular password).",
                "help": "Go to myaccount.google.com > Security > 2-Step Verification > App Passwords"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection error: {str(e)}"
            }

    def _persist_credentials(self, email_addr: str, app_password: str):
        """Append/update GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env file."""
        from pathlib import Path
        env_path = Path(settings.GMAIL_CREDENTIALS_PATH).parent / ".env"
        if not env_path.exists():
            env_path = Path(__file__).resolve().parent.parent.parent / ".env"

        try:
            lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
            new_lines = []
            found_email = False
            found_pw = False

            for line in lines:
                if line.strip().startswith("GMAIL_EMAIL="):
                    new_lines.append(f"GMAIL_EMAIL={email_addr}")
                    found_email = True
                elif line.strip().startswith("GMAIL_APP_PASSWORD="):
                    new_lines.append(f"GMAIL_APP_PASSWORD={app_password}")
                    found_pw = True
                else:
                    new_lines.append(line)

            if not found_email:
                new_lines.append(f"GMAIL_EMAIL={email_addr}")
            if not found_pw:
                new_lines.append(f"GMAIL_APP_PASSWORD={app_password}")

            env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
        except Exception as e:
            print(f"[GmailClient] Could not persist to .env: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Returns Gmail connection status."""
        return {
            "authenticated": self.is_authenticated,
            "mode": {
                "imap": f"IMAP ({self.gmail_email})",
                "oauth": "OAuth 2.0 Gmail API",
                "demo": "Demo / Offline Mode"
            }.get(self.auth_mode, "Demo / Offline Mode"),
            "auth_type": self.auth_mode,
            "email": self.gmail_email if self.auth_mode == "imap" else "",
            "credentials_found": os.path.exists(settings.GMAIL_CREDENTIALS_PATH),
            "token_found": os.path.exists(settings.GMAIL_TOKEN_PATH)
        }

    def fetch_threads(self, max_threads: int = 20) -> List[Dict[str, Any]]:
        """Fetch email threads from IMAP, Gmail API, or demo data."""

        # ── IMAP mode ──
        if self.auth_mode == "imap" and self.gmail_email and self.gmail_app_password:
            try:
                return self._fetch_imap_threads(max_threads)
            except Exception as e:
                print(f"[GmailClient] IMAP fetch error: {e}")
                return get_demo_leads()

        # ── OAuth mode ──
        if self.auth_mode == "oauth" and self.service:
            try:
                results = self.service.users().threads().list(userId='me', maxResults=max_threads).execute()
                threads = results.get('threads', [])
                processed = []
                for t in threads:
                    thread_detail = self.service.users().threads().get(userId='me', id=t['id']).execute()
                    messages = thread_detail.get('messages', [])
                    processed.append({
                        "id": t['id'],
                        "thread_length": len(messages)
                    })
                return processed
            except Exception as e:
                print(f"[GmailClient] OAuth fetch error: {e}")
                return get_demo_leads()

        # ── Demo mode ──
        return get_demo_leads()

    def _fetch_imap_threads(self, max_threads: int = 20) -> List[Dict[str, Any]]:
        """Fetch recent emails via IMAP using fast batch fetching and convert to lead-like format."""
        try:
            imap = imaplib.IMAP4_SSL("imap.gmail.com")
            imap.login(self.gmail_email, self.gmail_app_password)
            imap.select("INBOX")

            # Search for all emails
            status, data = imap.search(None, "ALL")
            if status != "OK" or not data or not data[0]:
                imap.logout()
                return get_demo_leads()

            email_ids = data[0].split()
            # Pick the top N most recent emails
            recent_ids = email_ids[-max_threads:] if len(email_ids) > max_threads else email_ids
            recent_ids_str = ",".join([i.decode() if isinstance(i, bytes) else str(i) for i in recent_ids])

            # Batch fetch all recent emails in a single IMAP call
            status, fetch_data = imap.fetch(recent_ids_str, "(RFC822)")
            imap.logout()

            if status != "OK" or not fetch_data:
                return get_demo_leads()

            thread_map = {}  # group by clean subject line

            for item in fetch_data:
                if not isinstance(item, tuple) or len(item) < 2:
                    continue

                try:
                    raw_email = item[1]
                    msg = email.message_from_bytes(raw_email)

                    subject = _decode_header_value(msg.get("Subject", "No Subject"))
                    from_addr = _decode_header_value(msg.get("From", ""))
                    to_addr = _decode_header_value(msg.get("To", ""))
                    date_str = msg.get("Date", "")
                    body = _extract_body(msg)

                    sender_name, sender_email = email.utils.parseaddr(from_addr)
                    if not sender_name:
                        sender_name = sender_email.split("@")[0].replace(".", " ").title() if sender_email else "Contact"

                    is_outbound = self.gmail_email.lower() in from_addr.lower()

                    try:
                        parsed_date = email.utils.parsedate_to_datetime(date_str)
                        nice_date = parsed_date.strftime("%b %d, %Y %I:%M %p")
                    except Exception:
                        nice_date = date_str[:20] if date_str else "Recent"

                    clean_subject = subject.strip()
                    for prefix in ["Re:", "RE:", "Fwd:", "FWD:", "re:", "fwd:"]:
                        if clean_subject.startswith(prefix):
                            clean_subject = clean_subject[len(prefix):].strip()

                    message_obj = {
                        "id": f"msg_{hash(subject + date_str) % 1000000}",
                        "sender": sender_name,
                        "sender_email": sender_email,
                        "date": nice_date,
                        "body": body[:2500],
                        "is_outbound": is_outbound,
                        "subject": subject
                    }

                    if clean_subject not in thread_map:
                        thread_map[clean_subject] = {
                            "subject": clean_subject,
                            "messages": [],
                            "participants": set(),
                            "latest_date": nice_date
                        }

                    thread_map[clean_subject]["messages"].append(message_obj)
                    if sender_email:
                        thread_map[clean_subject]["participants"].add(sender_email)

                except Exception as ex:
                    print(f"[GmailClient] Error parsing batch message: {ex}")
                    continue

            # Convert grouped threads to rich Sakha prospect format
            threads = []
            for idx, (subj, thread_data) in enumerate(thread_map.items()):
                msgs = thread_data["messages"]
                
                # Identify external prospect
                external_emails = [e for e in thread_data["participants"] if self.gmail_email.lower() not in e.lower()]
                contact_email = external_emails[0] if external_emails else (list(thread_data["participants"])[0] if thread_data["participants"] else "contact@client.com")
                
                contact_name = "Prospect"
                for m in msgs:
                    if not m["is_outbound"] and m["sender"] not in ["Unknown", "Contact", ""]:
                        contact_name = m["sender"]
                        break
                if contact_name == "Prospect" and "@" in contact_email:
                    contact_name = contact_email.split("@")[0].replace(".", " ").title()

                domain_part = contact_email.split("@")[1].split(".")[0].capitalize() if "@" in contact_email else "Enterprise"
                company_name = domain_part if domain_part not in ["Gmail", "Yahoo", "Outlook", "Hotmail", "Icloud"] else f"{contact_name}'s Team"

                threads.append({
                    "id": f"gmail-{idx+1}",
                    "name": contact_name,
                    "email": contact_email,
                    "company": company_name,
                    "role": "Key Contact",
                    "subject": subj,
                    "urgency": 6,
                    "category": "Inbound Conversation",
                    "status": "Awaiting Response" if not msgs[-1]["is_outbound"] else "Active",
                    "last_contact": thread_data["latest_date"],
                    "reason": f"Active thread with {len(msgs)} messages discussing '{subj[:80]}'",
                    "next_action": f"Review message from {contact_name} and send follow-up.",
                    "thread": msgs,
                    "signals": {
                        "buying_intent": "High" if any(k in subj.lower() for k in ["pricing", "demo", "proposal", "contract", "plan", "quote"]) else "Medium",
                        "response_lag_days": 1,
                        "unanswered_promise": False
                    },
                    "draft": {
                        "subject": f"Re: {subj}",
                        "body": f"Hi {contact_name},\n\nThank you for reaching out regarding {subj}.\n\nI wanted to follow up and see if you had any questions or if we should schedule a brief call this week.\n\nBest regards,\nSathwik",
                        "tone": "Professional"
                    },
                    "deal_size": ""
                })

            return threads if threads else get_demo_leads()

        except Exception as e:
            print(f"[GmailClient] IMAP fetch error: {e}")
            return get_demo_leads()

        return threads if threads else get_demo_leads()

    def create_draft(self, to_email: str, subject: str, body_text: str) -> Dict[str, Any]:
        """Create a draft via SMTP (IMAP mode), Gmail API (OAuth), or simulation (demo)."""

        # ── IMAP/SMTP mode: create draft via IMAP APPEND ──
        if self.auth_mode == "imap" and self.gmail_email and self.gmail_app_password:
            try:
                msg = MIMEText(body_text)
                msg["From"] = self.gmail_email
                msg["To"] = to_email
                msg["Subject"] = subject

                imap = imaplib.IMAP4_SSL("imap.gmail.com")
                imap.login(self.gmail_email, self.gmail_app_password)
                # Append to Gmail Drafts folder
                imap.append("[Gmail]/Drafts", "\\Draft", None, msg.as_bytes())
                imap.logout()

                return {
                    "success": True,
                    "mode": "imap",
                    "draft_id": f"imap_draft_{hash(subject) % 100000}",
                    "message": f"Draft saved to Gmail Drafts folder for {self.gmail_email}!",
                    "gmail_link": "https://mail.google.com/mail/u/0/#drafts"
                }
            except Exception as e:
                return {"success": False, "error": str(e), "message": f"Failed to create IMAP draft: {e}"}

        # ── OAuth mode ──
        if self.auth_mode == "oauth" and self.service:
            try:
                msg = MIMEText(body_text)
                msg["to"] = to_email
                msg["subject"] = subject
                raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

                draft = self.service.users().drafts().create(
                    userId='me',
                    body={'message': {'raw': raw}}
                ).execute()

                return {
                    "success": True,
                    "mode": "live",
                    "draft_id": draft.get('id'),
                    "message": "Draft created in your Gmail account!",
                    "gmail_link": f"https://mail.google.com/mail/u/0/#drafts/{draft.get('id')}"
                }
            except Exception as e:
                return {"success": False, "error": str(e), "message": f"Failed to create draft: {e}"}

        # ── Demo mode ──
        return {
            "success": True,
            "mode": "simulation",
            "draft_id": f"draft_mock_{id(body_text) % 100000}",
            "message": "Draft created in Demo Mode (connect Gmail to create real drafts)",
            "to": to_email,
            "subject": subject,
            "body": body_text
        }

    def send_email(self, to_email: str, subject: str, body_text: str) -> Dict[str, Any]:
        """Send an email via SMTP (only in IMAP mode, with explicit user action)."""
        if self.auth_mode != "imap" or not self.gmail_email or not self.gmail_app_password:
            return {"success": False, "message": "SMTP sending requires IMAP App Password credentials."}

        try:
            msg = MIMEText(body_text)
            msg["From"] = self.gmail_email
            msg["To"] = to_email
            msg["Subject"] = subject

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(self.gmail_email, self.gmail_app_password)
                server.send_message(msg)

            return {
                "success": True,
                "message": f"Email sent to {to_email} via SMTP."
            }
        except Exception as e:
            return {"success": False, "message": f"SMTP send failed: {e}"}


gmail_client = GmailClient()
