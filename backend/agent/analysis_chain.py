"""
Sakha AI Sales Intelligence Agent.
Combines deterministic signal detection (response lag, last sender, promise detection)
with LLM reasoning (Groq / Gemini) to produce explainable urgency scores (1-10),
actionable sales recommendations, and context-aware follow-up drafts.
"""

import json
import re
from typing import Dict, Any, Optional
from backend.config import settings

class AnalysisChain:
    def __init__(self):
        self.llm_provider = settings.LLM_PROVIDER
        self.groq_key = settings.GROQ_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    def calculate_deterministic_signals(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates hard sales signals from conversation thread.
        """
        thread = lead_data.get("thread", [])
        if not thread:
            return {
                "response_lag_days": 0,
                "last_sender_is_prospect": False,
                "buying_intent": "Low",
                "pricing_requested": False,
                "demo_mentioned": False,
                "meeting_requested": False,
                "call_scheduled": False,
                "call_confirmed": False,
                "call_rescheduled": False,
                "chat": False,
                "unanswered_promise": False,
                "thread_depth": 0
            }

        last_msg = thread[-1]
        last_sender_is_prospect = not last_msg.get("is_outbound", False)
        
        # Combine all conversation text
        full_text = " ".join([m.get("body", "") for m in thread]).lower()
        
        # Pricing signal
        has_pricing = any(k in full_text for k in ["pricing", "rupees", "rupee", "cost", "quote", "rate", "discount", "budget", "$", "₹"])
        
        # Meeting & Demo signals
        has_meeting = any(k in full_text for k in ["meeting", "schedule a call", "set up a call", "calendar", "calendly", "zoom", "google meet", "free for a call", "time to talk", "meet"])
        has_demo = any(k in full_text for k in ["demo", "walkthrough", "presentation", "screen share"])
        has_call_scheduled = any(k in full_text for k in ["scheduled for", "invite sent", "calendar invite", "see you on", "call is set"])
        has_call_confirmed = any(k in full_text for k in ["confirmed", "sounds good for the call", "looking forward to our call", "accepted the invitation"])
        has_call_rescheduled = any(k in full_text for k in ["reschedule", "push the call", "move the meeting", "can we postpone", "different time"])
        has_chat = any(k in full_text for k in ["chat", "quick question", "reach out", "touch base", "talk", "discuss"])
        
        # Unanswered promise check in sales reps' emails
        has_promise = False
        for msg in thread:
            if msg.get("is_outbound", False):
                b = msg.get("body", "").lower()
                if any(p in b for p in ["tomorrow", "shortly", "by end of day", "get back to you", "will send", "will share"]):
                    has_promise = True
                    
        return {
            "last_sender_is_prospect": last_sender_is_prospect,
            "pricing_requested": has_pricing,
            "demo_mentioned": has_demo,
            "meeting_requested": has_meeting and last_sender_is_prospect,
            "call_scheduled": has_call_scheduled,
            "call_confirmed": has_call_confirmed,
            "call_rescheduled": has_call_rescheduled,
            "chat": has_chat,
            "unanswered_promise": has_promise and last_sender_is_prospect,
            "thread_depth": len(thread)
        }

    def analyze_lead(self, lead_data: Dict[str, Any], custom_instructions: Optional[str] = None, tone: str = "Professional") -> Dict[str, Any]:
        """
        Runs full AI analysis on a prospect conversation.
        """
        signals = self.calculate_deterministic_signals(lead_data)
        
        # Try LLM inference via Groq or Gemini if keys are configured
        if self.llm_provider == "groq" and self.groq_key:
            llm_result = self._call_groq(lead_data, signals, custom_instructions, tone)
            if llm_result:
                return llm_result
        elif self.llm_provider == "gemini" and self.gemini_key:
            llm_result = self._call_gemini(lead_data, signals, custom_instructions, tone)
            if llm_result:
                return llm_result

        # High-precision heuristic AI reasoning fallback
        return self._heuristic_analysis(lead_data, signals, custom_instructions, tone)

    def generate_draft(self, lead_data: Dict[str, Any], tone: str = "Professional", custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a context-aware follow-up email draft with customizable tone.
        """
        analysis = self.analyze_lead(lead_data, custom_instructions=custom_prompt, tone=tone)
        return {
            "subject": analysis.get("draft_subject", f"Following up: {lead_data.get('company', 'Our Discussion')} & Sakha"),
            "recipient": lead_data.get("email", ""),
            "body": analysis.get("draft_message", ""),
            "tone": tone,
            "urgency": analysis.get("urgency", 5),
            "reason": analysis.get("reason", "")
        }

    def answer_rag_query(self, query: str, context_chunks: list) -> str:
        """
        Synthesizes an answer for RAG chat using retrieved context chunks.
        """
        if not context_chunks:
            return "Sakha searched your active sales conversations but found no relevant leads or discussions matching your query."

        # Format context
        formatted_context = "\n\n".join([f"Source [{c.get('metadata', {}).get('name', 'Lead')} - {c.get('metadata', {}).get('company', '')}]:\n{c.get('text', '')}" for c in context_chunks])
        prompt = f"""You are Sakha, an elite AI sales copilot. Answer the sales question accurately using only the provided email conversation context. Provide structured output with executive summary and conversation details.

Context:
{formatted_context}

Question:
{query}

Provide a concise, direct, executive-ready sales summary with clear actionable next steps."""

        # 1. Groq LLM option
        if self.llm_provider == "groq" and self.groq_key:
            try:
                from groq import Groq
                client = Groq(api_key=self.groq_key)
                for model_name in ["qwen/qwen3.6-27b", "openai/gpt-oss-120b", "groq/compound"]:
                    try:
                        resp = client.chat.completions.create(
                            model=model_name,
                            messages=[{"role": "user", "content": prompt}],
                            temperature=0.2
                        )
                        return resp.choices[0].message.content.strip()
                    except Exception:
                        continue
            except Exception as e:
                print(f"[AnalysisChain] Groq chat error: {e}")

        # 2. Gemini LLM option
        if self.llm_provider == "gemini" and self.gemini_key:
            try:
                try:
                    from google import genai
                    from google.genai import types
                    client = genai.Client(api_key=self.gemini_key)
                    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-flash"]:
                        try:
                            resp = client.models.generate_content(
                                model=model_name,
                                contents=prompt,
                                config=types.GenerateContentConfig(
                                    temperature=0.2
                                )
                            )
                            if resp and resp.text:
                                return resp.text.strip()
                        except Exception:
                            continue
                except ImportError:
                    import google.generativeai as legacy_genai
                    legacy_genai.configure(api_key=self.gemini_key)
                    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
                        try:
                            model = legacy_genai.GenerativeModel(model_name)
                            resp = model.generate_content(prompt)
                            if resp and resp.text:
                                return resp.text.strip()
                        except Exception:
                            continue
            except Exception as e:
                print(f"[AnalysisChain] Gemini chat error: {e}")

        # Smart deterministic synthesis fallback
        lead_names = list(set([c.get("metadata", {}).get("name", "") for c in context_chunks if c.get("metadata", {}).get("name")]))
        names_str = ", ".join(lead_names) if lead_names else "identified prospects"
        return f"Based on your recent inbox conversations, {names_str} match your query:\n\n" + "\n".join([f"• **{c.get('metadata', {}).get('name')} ({c.get('metadata', {}).get('company')}):** {c.get('text', '')[:180]}..." for c in context_chunks[:3]])

    def _sanitize_text(self, text: str) -> str:
        if not text:
            return ""
        # Normalize non-standard unicode dashes and quotes to clean ASCII
        text = text.replace('\u2011', '-').replace('\u2012', '-').replace('\u2013', '-').replace('\u2014', '--').replace('\u2212', '-')
        text = text.replace('\u2018', "'").replace('\u2019', "'").replace('\u201a', "'").replace('\u201b', "'")
        text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u201e', '"').replace('\u201f', '"')
        text = text.replace('\u2026', '...')
        # Encode to clean ascii ignoring unencodable emojis for clean display
        text = text.encode("ascii", "ignore").decode("ascii")
        return text

    def _sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        result = {}
        for k, v in data.items():
            if isinstance(v, str):
                result[k] = self._sanitize_text(v)
            elif isinstance(v, dict):
                result[k] = self._sanitize_dict(v)
            else:
                result[k] = v
        return result

    def _call_groq(self, lead_data: Dict[str, Any], signals: Dict[str, Any], custom_instructions: Optional[str], tone: str) -> Optional[Dict[str, Any]]:
        if not self.groq_key:
            return None
        import requests
        prompt = self._build_prompt(lead_data, signals, custom_instructions, tone)
        headers = {
            "Authorization": f"Bearer {self.groq_key}",
            "Content-Type": "application/json"
        }
        
        for model_name in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "qwen/qwen3.6-27b"]:
            try:
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": f"You are Sakha, an elite AI sales copilot. Generate an authentic, tailored email follow-up matching the '{tone}' tone exactly. Output strictly valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.4
                }
                res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=1.2)
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"].strip()
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\n", "", content)
                        content = re.sub(r"\n```$", "", content)
                    parsed = json.loads(content)
                    return self._sanitize_dict(parsed)
            except Exception:
                continue
        return None

    def _call_gemini(self, lead_data: Dict[str, Any], signals: Dict[str, Any], custom_instructions: Optional[str], tone: str) -> Optional[Dict[str, Any]]:
        if not self.gemini_key:
            return None
        import requests
        prompt = self._build_prompt(lead_data, signals, custom_instructions, tone)
        
        for model_name in ["gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt + "\n\nOutput strictly valid JSON with keys: urgency, urgency_level, reason, next_action, draft_subject, draft_message"}]}],
                    "generationConfig": {"temperature": 0.4}
                }
                res = requests.post(url, json=payload, timeout=1.2)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if text.startswith("```"):
                        text = re.sub(r"^```(?:json)?\n", "", text)
                        text = re.sub(r"\n```$", "", text)
                    parsed = json.loads(text)
                    return self._sanitize_dict(parsed)
            except Exception:
                continue
        return None

    def _build_prompt(self, lead_data: Dict[str, Any], signals: Dict[str, Any], custom_instructions: Optional[str], tone: str) -> str:
        tone_guidelines = {
            "Short & Direct": "Keep the email to 2-3 sentences maximum. Be ultra-concise, zero fluff, straight to the point, and end with a clear binary question or single next step.",
            "Warm & Friendly": "Use an appreciative, relationship-driven, enthusiastic, and warm tone. Greet warmly (e.g. 'Hope you are having a wonderful week!'), express gratitude, and offer help supportively.",
            "Urgent / Action-Oriented": "Use a fast-paced, action-oriented, time-sensitive tone. Highlight timeline preservation, upcoming deadlines, or securing terms promptly. Propose an immediate 10-minute sync today or tomorrow.",
            "Professional": "Use a polished, formal corporate executive tone. Focus on structured value, professional courtesy, and clear next steps."
        }
        
        guideline = tone_guidelines.get(tone, "Write a professional, context-aware follow-up email.")
        
        return f"""Analyze this prospect email thread and compose a tailored follow-up draft:
Prospect Name: {lead_data.get('name')}
Company: {lead_data.get('company')}
Email Address: {lead_data.get('email')}
Tone Requested: {tone} ({guideline})
Custom Rep Instructions: {custom_instructions or 'None'}

Conversation Thread Context:
{json.dumps(lead_data.get('thread', []), indent=2)}

Detected Signals:
{json.dumps(signals, indent=2)}

Tone Requirement:
{guideline}

Output strictly valid JSON with exactly these keys:
{{
  "urgency": <integer 1-10>,
  "urgency_level": <"Critical"|"High"|"Medium"|"Low">,
  "reason": "<one concise sentence explaining why this prospect requires follow-up>",
  "next_action": "<one specific sentence tactical next action>",
  "draft_subject": "<contextual Re: subject line>",
  "draft_message": "<full email body crafted in the requested {tone} tone>"
}}"""

    def _get_greeting_name(self, prospect_name: str, company: str, email_addr: str) -> str:
        if not prospect_name or prospect_name.lower() in ["unknown", "prospect", "contact", ""]:
            if email_addr and "@" in email_addr:
                handle = email_addr.split("@")[0]
                if "." in handle:
                    return handle.split(".")[0].capitalize()
                return handle.capitalize()
            return "there"
        
        org_keywords = ["team", "events", "support", "research", "solutions", "technologies", "media", "systems", "corp", "inc", "ltd", "llc", "cloud", "group", "community", "news", "updates", "mailer", "info", "notifications"]
        words = prospect_name.split()
        if any(w.lower() in org_keywords for w in words) or prospect_name.strip().lower() == company.strip().lower():
            clean_brand = words[0] if words else company
            return f"{clean_brand} Team"
            
        return words[0]

    def _heuristic_analysis(self, lead_data: Dict[str, Any], signals: Dict[str, Any], custom_instructions: Optional[str], tone: str) -> Dict[str, Any]:
        """Provides expert deterministic analysis and rich tone-specific drafts."""
        # Calculate dynamic urgency score (1-10)
        score = 5
        reasons = []

        if signals.get("unanswered_promise"):
            score += 3
            reasons.append("Unanswered promise detected in thread - immediate follow-up required.")
            
        if signals.get("meeting_requested"):
            score += 4
            reasons.append("Meeting or call was requested by the prospect.")
        elif signals.get("pricing_requested"):
            score += 2
            reasons.append("Prospect inquired about pricing or terms.")
        elif signals.get("call_scheduled"):
            score += 3
            reasons.append("Call was scheduled in the thread.")
        elif signals.get("call_confirmed"):
            score += 2
            reasons.append("Call was confirmed by the prospect.")   
        elif signals.get("call_rescheduled"):
            score += 2
            reasons.append("Call was rescheduled by the prospect.")   
        elif signals.get("demo_mentioned"):
            score += 1
            reasons.append("Demo, presentation, or review call discussed.")
        elif signals.get("chat"):
            score += 1
            reasons.append("Chat or inquiry was initiated by the prospect.")

        if signals.get("last_sender_is_prospect"):
            score += 2
            reasons.append("Awaiting reply from our side.")
        else:
            score -= 1

        score = max(1, min(10, score))
        level = "Critical" if score >= 8.5 else ("High" if score >= 7.5 else ("Medium" if score >= 4 else "Low"))
        
        prospect_name = lead_data.get("name", "Prospect")
        company = lead_data.get("company", "Company")
        email_addr = lead_data.get("email", "")
        subject = lead_data.get("subject", "our discussion")
        clean_subject = subject.replace("Re:", "").replace("RE:", "").replace("Fwd:", "").replace("FWD:", "").strip()
        
        greeting_name = self._get_greeting_name(prospect_name, company, email_addr)
        sender_full_name = settings.sender_display_name
        sender_first_name = sender_full_name.split()[0]
        
        reason_text = " ".join(reasons) if reasons else f"Active message thread regarding '{clean_subject[:60]}' with {prospect_name}."
        next_action_text = f"Send personalized follow-up to {greeting_name} regarding {clean_subject[:50]}." if signals.get("last_sender_is_prospect") else f"Check in with {greeting_name} to confirm receipt and maintain momentum."

        # Distinct, rich templates for each tone:
        if tone == "Short & Direct":
            body = (
                f"Hi {greeting_name},\n\n"
                f"Following up on {clean_subject} for {company}.\n\n"
                f"Are you free for a quick 5-minute sync tomorrow at 11:00 AM to review next steps?\n\n"
                f"Best,\n"
                f"{sender_first_name}"
            )
        elif tone == "Warm & Friendly":
            body = (
                f"Hi {greeting_name},\n\n"
                f"Hope you are having a wonderful week!\n\n"
                f"I wanted to check in regarding our conversation on {clean_subject}. We would love to assist {company} and make sure all your questions are answered.\n\n"
                f"Please let me know if you would like to jump on a quick call this week, or if I can share any additional information.\n\n"
                f"Warm regards,\n"
                f"{sender_full_name}"
            )
        elif tone == "Urgent / Action-Oriented":
            body = (
                f"Hi {greeting_name},\n\n"
                f"Following up right away on {clean_subject} so we don't hold up your timeline for {company}.\n\n"
                f"I have everything ready on our end—could we do a brief 10-minute call today or tomorrow morning to lock in next steps?\n\n"
                f"Best regards,\n"
                f"{sender_full_name}"
            )
        else:  # Professional (Default)
            body = (
                f"Hi {greeting_name},\n\n"
                f"Thank you for your time regarding {clean_subject}.\n\n"
                f"I am following up to review our discussion for {company} and address any questions your team may have as we move forward.\n\n"
                f"Please let me know your availability this week for a brief review session.\n\n"
                f"Best regards,\n"
                f"{sender_full_name}"
            )

        if custom_instructions:
            body = (
                f"Hi {greeting_name},\n\n"
                f"{custom_instructions}\n\n"
                f"Looking forward to hearing from you.\n\n"
                f"Best regards,\n"
                f"{sender_full_name}"
            )

        return {
            "urgency": score,
            "urgency_level": level,
            "reason": reason_text,
            "next_action": next_action_text,
            "draft_subject": f"Re: {clean_subject}",
            "draft_message": body,
            "signals": signals
        }

analysis_chain = AnalysisChain()
