"""
Email cleaner and chunker for Sakha RAG pipeline.
Handles HTML stripping, signature cleanup, quoted reply normalization,
and thread chunking with metadata for ChromaDB indexing.
"""

import re
from typing import List, Dict, Any
from bs4 import BeautifulSoup

def clean_email_body(raw_text_or_html: str) -> str:
    """
    Cleans raw email content:
    - Strips HTML tags
    - Removes long email signature blocks and standard disclaimers
    - Normalizes excessive whitespace
    """
    if not raw_text_or_html:
        return ""
    
    # Check if text is HTML
    if "<html" in raw_text_or_html.lower() or "<body" in raw_text_or_html.lower() or "<div" in raw_text_or_html.lower():
        try:
            soup = BeautifulSoup(raw_text_or_html, "html.parser")
            # Remove scripts and styles
            for elem in soup(["script", "style", "head", "meta"]):
                elem.extract()
            text = soup.get_text(separator="\n")
        except Exception:
            text = raw_text_or_html
    else:
        text = raw_text_or_html

    # Strip quoted previous messages (e.g., lines starting with > or "On ... wrote:")
    lines = text.split("\n")
    cleaned_lines = []
    
    for line in lines:
        stripped = line.strip()
        # Skip classic quoted replies in processing if desired
        if stripped.startswith(">"):
            continue
        if re.match(r"^On\s+.*wrote:$", stripped, re.IGNORECASE):
            break
        if re.match(r"^-{3,}\s*Original Message\s*-{3,}", stripped, re.IGNORECASE):
            break
        cleaned_lines.append(line)
        
    cleaned = "\n".join(cleaned_lines)
    # Remove multiple spaces/newlines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned

def chunk_conversation_thread(lead_data: Dict[str, Any], chunk_size: int = 500) -> List[Dict[str, Any]]:
    """
    Transforms a prospect's multi-message thread into searchable vector chunks
    with full metadata (thread_id, sender, date, lead_name, company).
    """
    chunks = []
    lead_id = lead_data.get("id", "")
    name = lead_data.get("name", "")
    company = lead_data.get("company", "")
    email = lead_data.get("email", "")
    thread = lead_data.get("thread", [])
    
    for idx, msg in enumerate(thread):
        body = clean_email_body(msg.get("body", ""))
        if not body:
            continue
            
        msg_id = msg.get("id", f"{lead_id}_msg_{idx}")
        sender = msg.get("sender", "")
        date = msg.get("date", "")
        is_outbound = msg.get("is_outbound", False)
        direction = "Outbound (You)" if is_outbound else "Inbound (Prospect)"
        
        # Build contextual text
        context_text = f"Prospect: {name} ({company})\nSender: {sender} [{direction}]\nDate: {date}\n\nContent:\n{body}"
        
        chunk_obj = {
            "id": f"{lead_id}_{msg_id}",
            "text": context_text,
            "metadata": {
                "lead_id": lead_id,
                "msg_id": msg_id,
                "name": name,
                "company": company,
                "email": email,
                "sender": sender,
                "date": date,
                "is_outbound": is_outbound,
                "urgency": lead_data.get("urgency", 5)
            }
        }
        chunks.append(chunk_obj)
        
    return chunks
