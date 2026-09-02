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
    """Decode an RFC 2047 encoded email header value safely."""
    if val is None:
        return ""
    try:
        parts = decode_header(val)
        result = []
        for data, charset in parts:
            if isinstance(data, bytes):
                result.append(data.decode(charset or "utf-8", errors="replace"))
            else:
                result.append(str(data))
        text = " ".join(result)
        # Normalize non-standard unicode dashes and quotes
        text = text.replace('\u2011', '-').replace('\u2012', '-').replace('\u2013', '-').replace('\u2014', '--')
        text = text.replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
        text = text.replace('\u2026', '...')
        # Remove unencodable high-range emojis for clean display
        text = text.encode("ascii", "ignore").decode("ascii")
        return text.strip()
    except Exception:
        return str(val) if val else ""


def _clean_html_text(html_content: str) -> str:
    """Converts HTML email body to clean, readable plain text without code or CSS."""
    if not html_content:
        return ""
    import html
    import re
    # 1. Strip script and style blocks
    text = re.sub(r"<(style|script|head|meta|link)[^>]*>.*?</\1>", "", html_content, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    # 2. Convert block separators to newlines
    text = re.sub(r"<(br|p|div|tr|h[1-6])[^>]*>", "\n", text, flags=re.IGNORECASE)
    # 3. Strip remaining HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # 4. Unescape HTML entities
    text = html.unescape(text)
    # 5. Normalize whitespace and clean lines
    clean_lines = []
    for line in text.splitlines():
        line = re.sub(r"[ \t]+", " ", line).strip()
        # Filter out common tracking / newsletter noise lines
        if line and not any(noise in line.lower() for noise in ["view in browser", "unsubscribe here", "click here to unsubscribe"]):
            clean_lines.append(line)
    
    result = "\n".join(clean_lines)
    # Deduplicate excessive newlines
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()


def _extract_gmail_api_body(payload: Dict[str, Any]) -> str:
    """
    Extract plain text or cleaned HTML body from a Gmail API message payload.
    Handles nested multipart structures and base64url decoding.
    """
    if not payload:
        return ""

    body_plain = ""
    body_html = ""

    def _walk_parts(part: Dict[str, Any]):
        nonlocal body_plain, body_html
        if not isinstance(part, dict):
            return

        mime_type = part.get("mimeType", "").lower()
        headers = part.get("headers", [])

        # Skip attachments
        for h in headers:
            if h.get("name", "").lower() == "content-disposition" and "attachment" in h.get("value", "").lower():
                return

        body_data = part.get("body", {}).get("data")
        if body_data:
            try:
                # Gmail API uses URL-safe base64 encoding (RFC 4648)
                padded_data = body_data + "=" * ((4 - len(body_data) % 4) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded_data.encode("ascii"))
                decoded_text = decoded_bytes.decode("utf-8", errors="replace")

                if mime_type == "text/plain" and not body_plain:
                    body_plain = decoded_text
                elif mime_type == "text/html" and not body_html:
                    body_html = decoded_text
            except Exception:
                pass

        # Recursively walk subparts
        for sub_part in part.get("parts", []):
            _walk_parts(sub_part)

    _walk_parts(payload)

    if body_plain:
        lines = [l.strip() for l in body_plain.splitlines() if l.strip()]
        return "\n".join(lines[:40])
    elif body_html:
        return _clean_html_text(body_html)[:2500]
    return ""


def _extract_body(msg):
    """Extract plain text body from an email.message.Message object."""
    body_plain = ""
    body_html = ""
    
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            cd = str(part.get("Content-Disposition", ""))
            if "attachment" in cd.lower():
                continue
            if ct == "text/plain" and not body_plain:
                payload = part.get_payload(decode=True)
                if payload:
                    body_plain = payload.decode("utf-8", errors="replace")
            elif ct == "text/html" and not body_html:
                payload = part.get_payload(decode=True)
                if payload:
                    body_html = payload.decode("utf-8", errors="replace")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            raw = payload.decode("utf-8", errors="replace")
            if msg.get_content_type() == "text/html":
                body_html = raw
            else:
                body_plain = raw

    if body_plain:
        # Normalize whitespace
        lines = [l.strip() for l in body_plain.splitlines() if l.strip()]
        return "\n".join(lines[:40])
    elif body_html:
        return _clean_html_text(body_html)[:2500]
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
                if os.path.exists(token_path) and os.path.getsize(token_path) > 0:
                    try:
                        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
                    except Exception as token_err:
                        print(f"[GmailClient] Could not read token.json: {token_err}. Will re-authenticate if credentials.json is present.")
                if not creds or not creds.valid:
                    if creds and creds.expired and creds.refresh_token:
                        try:
                            creds.refresh(Request())
                            with open(token_path, 'w') as token:
                                token.write(creds.to_json())
                        except Exception as ref_err:
                            print(f"[GmailClient] Token refresh notice: {ref_err}")
                            creds = None

                if creds and creds.valid:
                    self.service = build('gmail', 'v1', credentials=creds)
                    self.is_authenticated = True
                    self.auth_mode = "oauth"
                    try:
                        profile = self.service.users().getProfile(userId='me').execute()
                        self.gmail_email = profile.get('emailAddress', '')
                    except Exception:
                        pass
                    print(f"[GmailClient] OAuth2 Gmail API authenticated as {self.gmail_email or 'User'}")
                    return
            except Exception as e:
                print(f"[GmailClient] Startup OAuth check notice: {e}")

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

    def authenticate_interactive_oauth(self) -> Dict[str, Any]:
        """
        Explicitly triggers Google OAuth 2.0 flow using credentials.json and token.json.
        """
        creds_path = settings.GMAIL_CREDENTIALS_PATH
        token_path = settings.GMAIL_TOKEN_PATH
        SCOPES = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.compose'
        ]

        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build

            creds = None
            if os.path.exists(token_path) and os.path.getsize(token_path) > 0:
                try:
                    creds = Credentials.from_authorized_user_file(token_path, SCOPES)
                except Exception as token_err:
                    print(f"[GmailClient] Could not read token.json: {token_err}")
                    creds = None

            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    try:
                        creds.refresh(Request())
                    except Exception as ref_err:
                        print(f"[GmailClient] Token refresh failed: {ref_err}")
                        creds = None
                if (not creds or not creds.valid) and os.path.exists(creds_path) and os.path.getsize(creds_path) > 0:
                    flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
                    creds = flow.run_local_server(port=0)
                    with open(token_path, 'w') as token:
                        token.write(creds.to_json())

            if creds:
                self.service = build('gmail', 'v1', credentials=creds)
                self.is_authenticated = True
                self.auth_mode = "oauth"
                try:
                    profile = self.service.users().getProfile(userId='me').execute()
                    self.gmail_email = profile.get('emailAddress', '')
                except Exception:
                    pass
                print(f"[GmailClient] OAuth2 Google Sign-In successful for {self.gmail_email or 'User'}")
                return {
                    "success": True,
                    "email": self.gmail_email,
                    "mode": "oauth",
                    "message": f"Successfully authenticated with Google as {self.gmail_email or 'Authorized User'}"
                }
            else:
                return {
                    "success": False,
                    "message": "credentials.json not found in project root. Please provide Google OAuth client credentials."
                }
        except Exception as e:
            print(f"[GmailClient] Interactive OAuth failed: {e}")
            return {
                "success": False,
                "message": f"Google authentication failed: {str(e)}"
            }

    def get_status(self) -> Dict[str, Any]:
        """Returns Gmail connection status."""
        user_email = self.gmail_email or ""
        if not user_email and self.service and self.auth_mode == "oauth":
            try:
                profile = self.service.users().getProfile(userId='me').execute()
                user_email = profile.get('emailAddress', '')
                self.gmail_email = user_email
            except Exception:
                pass

        return {
            "authenticated": self.is_authenticated,
            "mode": {
                "imap": f"IMAP ({user_email})",
                "oauth": "Google OAuth 2.0",
                "demo": "Demo / Offline Mode"
            }.get(self.auth_mode, "Demo / Offline Mode"),
            "auth_type": self.auth_mode,
            "email": user_email,
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
                return self._fetch_oauth_threads(max_threads)
            except Exception as e:
                print(f"[GmailClient] OAuth fetch error: {e}")
                return get_demo_leads()

        # ── Demo mode ──
        return get_demo_leads()

    def _fetch_oauth_threads(self, max_threads: int = 20) -> List[Dict[str, Any]]:
        """Fetch email threads via OAuth 2.0 Gmail API and return full Sakha conversation objects."""
        user_email = self.gmail_email or ""
        if not user_email and self.service:
            try:
                profile = self.service.users().getProfile(userId='me').execute()
                user_email = profile.get('emailAddress', '')
                if user_email:
                    self.gmail_email = user_email
            except Exception as ex:
                print(f"[GmailClient] Could not fetch user profile email: {ex}")

        results = self.service.users().threads().list(userId='me', maxResults=max_threads).execute()
        threads = results.get('threads', [])
        if not threads:
            return get_demo_leads()

        processed_threads = []
        sender_display = settings.sender_display_name

        for t in threads:
            thread_id = t.get('id', '')
            if not thread_id:
                continue

            try:
                thread_detail = self.service.users().threads().get(
                    userId='me',
                    id=thread_id,
                    format='full'
                ).execute()
                raw_messages = thread_detail.get('messages', [])
                if not raw_messages:
                    continue

                parsed_messages = []
                thread_participants = set()
                thread_subject = "No Subject"

                for msg in raw_messages:
                    msg_id = msg.get("id", "")
                    payload = msg.get("payload", {})
                    label_ids = msg.get("labelIds", [])

                    # Parse headers into a dictionary
                    header_map = {}
                    for h in payload.get("headers", []):
                        h_name = h.get("name", "").lower()
                        if h_name not in header_map:
                            header_map[h_name] = h.get("value", "")

                    from_raw = header_map.get("from", "")
                    to_raw = header_map.get("to", "")
                    subject_raw = header_map.get("subject", "No Subject")
                    date_raw = header_map.get("date", "")

                    from_decoded = _decode_header_value(from_raw)
                    to_decoded = _decode_header_value(to_raw)
                    subject_decoded = _decode_header_value(subject_raw) or "No Subject"

                    if not thread_subject or thread_subject == "No Subject":
                        thread_subject = subject_decoded

                    sender_name, sender_email = email.utils.parseaddr(from_decoded)
                    if not sender_name:
                        sender_name = sender_email.split("@")[0].replace(".", " ").title() if sender_email else "Contact"

                    recipient_name, recipient_email = email.utils.parseaddr(to_decoded)

                    # Determine if outbound
                    is_outbound = "SENT" in label_ids or bool(user_email and user_email.lower() in from_decoded.lower())

                    # Parse date nicely
                    nice_date = ""
                    if date_raw:
                        try:
                            parsed_date = email.utils.parsedate_to_datetime(date_raw)
                            nice_date = parsed_date.strftime("%b %d, %Y %I:%M %p")
                        except Exception:
                            nice_date = date_raw[:20]

                    if not nice_date:
                        internal_date = msg.get("internalDate")
                        if internal_date:
                            try:
                                import datetime
                                dt = datetime.datetime.fromtimestamp(int(internal_date) / 1000.0)
                                nice_date = dt.strftime("%b %d, %Y %I:%M %p")
                            except Exception:
                                nice_date = "Recent"
                        else:
                            nice_date = "Recent"

                    body = _extract_gmail_api_body(payload)
                    if not body and msg.get("snippet"):
                        body = _clean_html_text(msg.get("snippet", ""))

                    if sender_email:
                        thread_participants.add(sender_email)
                    if recipient_email:
                        thread_participants.add(recipient_email)

                    parsed_messages.append({
                        "id": msg_id,
                        "message_id": msg_id,
                        "thread_id": thread_id,
                        "sender": sender_name,
                        "sender_email": sender_email,
                        "recipient": to_decoded,
                        "recipient_email": recipient_email,
                        "subject": subject_decoded,
                        "date": nice_date,
                        "snippet": msg.get("snippet", ""),
                        "body": body[:2500],
                        "is_outbound": is_outbound
                    })

                if not parsed_messages:
                    continue

                # Strip Re:/Fwd: prefixes for display
                clean_subject = thread_subject.strip()
                for prefix in ["Re:", "RE:", "Fwd:", "FWD:", "re:", "fwd:"]:
                    if clean_subject.startswith(prefix):
                        clean_subject = clean_subject[len(prefix):].strip()

                # Identify external prospect
                external_emails = [e for e in thread_participants if not user_email or user_email.lower() not in e.lower()]
                contact_email = external_emails[0] if external_emails else (list(thread_participants)[0] if thread_participants else "contact@client.com")

                contact_name = "Prospect"
                for m in parsed_messages:
                    if not m["is_outbound"] and m["sender"] not in ["Unknown", "Contact", "", "Prospect"]:
                        contact_name = m["sender"]
                        break
                if contact_name == "Prospect" and "@" in contact_email:
                    contact_name = contact_email.split("@")[0].replace(".", " ").title()

                domain_part = contact_email.split("@")[1].split(".")[0].capitalize() if "@" in contact_email else "Enterprise"
                company_name = domain_part if domain_part not in ["Gmail", "Yahoo", "Outlook", "Hotmail", "Icloud"] else f"{contact_name}'s Team"

                # Intelligent category classification
                subj_lower = clean_subject.lower()
                body_sample = (parsed_messages[-1]["body"] if parsed_messages else "").lower()
                combined_text = f"{subj_lower} {body_sample}"

                if any(k in combined_text for k in ["meeting", "scheduled", "calendar", "call", "zoom", "meet"]):
                    category = "Meeting / Call"
                elif any(k in combined_text for k in ["pricing", "proposal", "contract", "quote", "cost", "invoice"]):
                    category = "Pricing & Terms"
                elif any(k in combined_text for k in ["demo", "walkthrough", "presentation", "trial"]):
                    category = "Product Demo"
                elif any(k in combined_text for k in ["connect", "introduction", "partnership", "collaborate", "hackathon", "event"]):
                    category = "Partnership / Event"
                else:
                    category = "Inbound Discussion"

                is_awaiting = not parsed_messages[-1]["is_outbound"] if parsed_messages else False
                latest_date = parsed_messages[-1]["date"] if parsed_messages else "Recent"

                processed_threads.append({
                    "id": thread_id,
                    "name": contact_name,
                    "email": contact_email,
                    "company": company_name,
                    "role": "Key Contact",
                    "subject": clean_subject,
                    "urgency": 7 if is_awaiting else 5,
                    "category": category,
                    "status": "Awaiting Response" if is_awaiting else "Active",
                    "last_contact": latest_date,
                    "reason": f"Active thread with {len(parsed_messages)} message(s) regarding '{clean_subject[:70]}'",
                    "next_action": f"Send personalized follow-up to {contact_name} regarding {clean_subject[:45]}." if is_awaiting else f"Follow up with {contact_name} to maintain momentum.",
                    "thread": parsed_messages,
                    "signals": {
                        "buying_intent": "High" if any(k in combined_text for k in ["pricing", "demo", "proposal", "contract", "cost"]) else "Medium",
                        "response_lag_days": 1,
                        "unanswered_promise": False
                    },
                    "draft": {
                        "subject": f"Re: {clean_subject}",
                        "recipient": contact_email,
                        "body": f"Hi {contact_name.split()[0]},\n\nThank you for reaching out regarding {clean_subject}.\n\nI am following up to review our discussion for {company_name} and address any questions your team may have as we move forward.\n\nPlease let me know your availability this week for a brief review session.\n\nBest regards,\n{sender_display}",
                        "tone": "Professional"
                    },
                    "deal_size": ""
                })
            except Exception as thread_ex:
                print(f"[GmailClient] Error parsing thread {thread_id}: {thread_ex}")
                continue

        return processed_threads if processed_threads else get_demo_leads()

    def _fetch_imap_threads(self, max_threads: int = 25) -> List[Dict[str, Any]]:
        """Fetch recent emails via IMAP using optimized batch fetching and clean prospect extraction."""
        try:
            imap = imaplib.IMAP4_SSL("imap.gmail.com")
            imap.login(self.gmail_email, self.gmail_app_password)
            imap.select("INBOX", readonly=True)

            # Search for latest email IDs
            status, data = imap.search(None, "ALL")
            if status != "OK" or not data or not data[0]:
                imap.logout()
                return get_demo_leads()

            email_ids = data[0].split()
            # Pick top N most recent emails
            recent_ids = email_ids[-max_threads:] if len(email_ids) > max_threads else email_ids
            recent_ids_str = ",".join([i.decode() if isinstance(i, bytes) else str(i) for i in recent_ids])

            # Batch fetch all recent emails in a single IMAP call
            status, fetch_data = imap.fetch(recent_ids_str, "(RFC822)")
            imap.logout()

            if status != "OK" or not fetch_data:
                return get_demo_leads()

            thread_map = {}  # group by (subject, external_contact)
            sender_display = settings.sender_display_name

            for item in fetch_data:
                if not isinstance(item, tuple) or len(item) < 2:
                    continue

                try:
                    raw_email = item[1]
                    msg = email.message_from_bytes(raw_email)

                    subject_raw = _decode_header_value(msg.get("Subject", "")).strip()
                    from_addr = _decode_header_value(msg.get("From", ""))
                    to_addr = _decode_header_value(msg.get("To", ""))
                    date_str = msg.get("Date", "")
                    body = _extract_body(msg)

                    sender_name, sender_email = email.utils.parseaddr(from_addr)
                    if not sender_name:
                        sender_name = sender_email.split("@")[0].replace(".", " ").title() if sender_email else "Contact"

                    to_name, to_email = email.utils.parseaddr(to_addr)

                    is_outbound = bool(self.gmail_email and self.gmail_email.lower() in from_addr.lower())

                    try:
                        parsed_date = email.utils.parsedate_to_datetime(date_str)
                        nice_date = parsed_date.strftime("%b %d, %Y %I:%M %p")
                    except Exception:
                        nice_date = date_str[:20] if date_str else "Recent"

                    clean_subject = subject_raw
                    for prefix in ["Re:", "RE:", "Fwd:", "FWD:", "re:", "fwd:"]:
                        if clean_subject.startswith(prefix):
                            clean_subject = clean_subject[len(prefix):].strip()

                    # External contact identifier
                    external_contact = sender_email if not is_outbound else (to_email or "unknown@domain.com")
                    external_name = sender_name if not is_outbound else (to_name or "Contact")

                    # If subject is empty or generic, extract fallback subject from body snippet or sender
                    if not clean_subject or clean_subject.lower() in ["no subject", "(no subject)", "none", ""]:
                        first_line = body.strip().split("\n")[0].strip() if body else ""
                        if first_line and len(first_line) > 3:
                            clean_subject = first_line[:50]
                        else:
                            clean_subject = f"Message from {external_name}"

                    message_id = msg.get("Message-ID", f"msg_{hash(subject_raw + date_str + from_addr) % 1000000}")

                    message_obj = {
                        "id": f"msg_{hash(subject_raw + date_str + from_addr) % 1000000}",
                        "sender": sender_name,
                        "sender_email": sender_email,
                        "date": nice_date,
                        "body": body[:2500],
                        "is_outbound": is_outbound,
                        "subject": subject_raw or clean_subject
                    }

                    # Group key ensures separate external senders never get merged into one lead
                    thread_key = f"{external_contact.lower()}::{clean_subject.lower()}"

                    if thread_key not in thread_map:
                        thread_map[thread_key] = {
                            "subject": clean_subject,
                            "messages": [],
                            "contact_email": external_contact,
                            "contact_name": external_name,
                            "latest_date": nice_date
                        }

                    thread_map[thread_key]["messages"].append(message_obj)

                except Exception as ex:
                    print(f"[GmailClient] Error parsing batch message: {ex}")
                    continue

            # Convert grouped threads to rich Sakha prospect format
            threads = []
            for idx, (t_key, thread_data) in enumerate(thread_map.items()):
                msgs = thread_data["messages"]
                subj = thread_data["subject"]
                contact_email = thread_data["contact_email"]
                contact_name = thread_data["contact_name"]
                
                if contact_name in ["Prospect", "Contact", ""] and "@" in contact_email:
                    contact_name = contact_email.split("@")[0].replace(".", " ").title()

                domain_part = contact_email.split("@")[1].split(".")[0].capitalize() if "@" in contact_email else "Enterprise"
                company_name = domain_part if domain_part not in ["Gmail", "Yahoo", "Outlook", "Hotmail", "Icloud"] else f"{contact_name}'s Team"

                # Intelligent category classification
                subj_lower = subj.lower()
                body_sample = (msgs[-1]["body"] if msgs else "").lower()
                combined_text = f"{subj_lower} {body_sample}"
                
                if any(k in combined_text for k in ["meeting", "scheduled", "calendar", "call", "zoom", "meet"]):
                    category = "Meeting / Call"
                elif any(k in combined_text for k in ["pricing", "proposal", "contract", "quote", "cost", "invoice", "rupees", "$", "₹"]):
                    category = "Pricing & Terms"
                elif any(k in combined_text for k in ["demo", "walkthrough", "presentation", "trial"]):
                    category = "Product Demo"
                elif any(k in combined_text for k in ["connect", "introduction", "partnership", "collaborate", "hackathon", "event"]):
                    category = "Partnership / Event"
                else:
                    category = "Inbound Discussion"

                is_awaiting = not msgs[-1]["is_outbound"] if msgs else False

                threads.append({
                    "id": f"gmail-{idx+1}",
                    "name": contact_name,
                    "email": contact_email,
                    "company": company_name,
                    "role": "Key Contact",
                    "subject": subj,
                    "urgency": 7 if is_awaiting else 5,
                    "category": category,
                    "status": "Awaiting Response" if is_awaiting else "Active",
                    "last_contact": thread_data["latest_date"],
                    "reason": f"Active thread with {len(msgs)} message(s) regarding '{subj[:70]}'",
                    "next_action": f"Send personalized follow-up to {contact_name} regarding {subj[:45]}." if is_awaiting else f"Follow up with {contact_name} to maintain momentum.",
                    "thread": msgs,
                    "signals": {
                        "buying_intent": "High" if any(k in combined_text for k in ["pricing", "demo", "proposal", "contract", "cost", "hackathon"]) else "Medium",
                        "response_lag_days": 1,
                        "unanswered_promise": False
                    },
                    "draft": {
                        "subject": f"Re: {subj}",
                        "recipient": contact_email,
                        "body": f"Hi {contact_name.split()[0]},\n\nThank you for reaching out regarding {subj}.\n\nI am following up to review our discussion for {company_name} and address any questions your team may have as we move forward.\n\nPlease let me know your availability this week for a brief review session.\n\nBest regards,\n{sender_display}",
                        "tone": "Professional"
                    },
                    "deal_size": ""
                })

            return threads if threads else get_demo_leads()

        except Exception as e:
            print(f"[GmailClient] IMAP fetch error: {e}")
            return get_demo_leads()


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

    def start_watch(self, topic_name: Optional[str] = None) -> Dict[str, Any]:
        """Starts real-time Gmail Pub/Sub push watch on INBOX."""
        topic = topic_name or settings.GMAIL_PUBSUB_TOPIC
        if not topic:
            return {"status": "error", "message": "GMAIL_PUBSUB_TOPIC not configured in .env (e.g. projects/YOUR_PROJECT/topics/sakha-gmail-watch)"}

        if self.auth_mode == "oauth" and self.service:
            try:
                request = {
                    'labelIds': ['INBOX'],
                    'topicName': topic
                }
                res = self.service.users().watch(userId='me', body=request).execute()
                print(f"[GmailClient] Pub/Sub watch active on {topic}: {res}")
                return {
                    "status": "success",
                    "historyId": res.get("historyId"),
                    "expiration": res.get("expiration"),
                    "topic": topic,
                    "message": f"Real-time Gmail Pub/Sub watch activated on {topic}"
                }
            except Exception as e:
                return {"status": "error", "message": f"Failed to start watch: {e}"}

        return {
            "status": "error",
            "message": "Pub/Sub watch requires OAuth 2.0 (credentials.json + token.json). IMAP mode uses fast local sync."
        }

    def stop_watch(self) -> Dict[str, Any]:
        """Stops real-time Gmail Pub/Sub push watch."""
        if self.auth_mode == "oauth" and self.service:
            try:
                self.service.users().stop(userId='me').execute()
                return {"status": "success", "message": "Gmail Pub/Sub watch stopped."}
            except Exception as e:
                return {"status": "error", "message": f"Failed to stop watch: {e}"}
        return {"status": "success", "message": "No active OAuth watch."}


gmail_client = GmailClient()
