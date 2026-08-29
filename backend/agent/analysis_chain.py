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
        try:
            from groq import Groq
            client = Groq(api_key=self.groq_key)
            prompt = self._build_prompt(lead_data, signals, custom_instructions, tone)
            
            for model_name in ["qwen/qwen3.6-27b", "openai/gpt-oss-120b", "groq/compound"]:
                try:
                    resp = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": "You are Sakha, a world-class AI sales intelligence agent. Output strictly valid JSON matching the schema."},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.5
                    )
                    content = resp.choices[0].message.content.strip()
                    # Strip any markdown fences if present
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\n", "", content)
                        content = re.sub(r"\n```$", "", content)
                    parsed = json.loads(content)
                    return self._sanitize_dict(parsed)
                except Exception:
                    continue
            return None
        except Exception as e:
            print(f"[AnalysisChain] Groq execution error: {e}")
            return None

    def _call_gemini(self, lead_data: Dict[str, Any], signals: Dict[str, Any], custom_instructions: Optional[str], tone: str) -> Optional[Dict[str, Any]]:
        try:
            prompt = self._build_prompt(lead_data, signals, custom_instructions, tone)
            
            # 1. Try modern google-genai SDK
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=self.gemini_key)
                system_instruction = "You are Sakha, a world-class AI sales intelligence agent. Output strictly valid JSON matching the schema."
                
                for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-flash"]:
                    try:
                        resp = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                response_mime_type="application/json",
                                temperature=0.5,
                            )
                        )
                        text = resp.text.strip() if resp and resp.text else ""
                        if text.startswith("```"):
                            text = re.sub(r"^```(?:json)?\n", "", text)
                            text = re.sub(r"\n```$", "", text)
                        parsed = json.loads(text)
                        return self._sanitize_dict(parsed)
                    except Exception as model_err:
                        print(f"[AnalysisChain] Gemini model {model_name} attempt error: {model_err}")
                        continue
            except ImportError:
                # 2. Fallback to legacy google.generativeai if google-genai is not installed
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=self.gemini_key)
                for model_name in ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']:
                    try:
                        model = legacy_genai.GenerativeModel(model_name)
                        resp = model.generate_content(prompt + "\n\nOutput strictly valid JSON with no markdown formatting.")
                        text = resp.text.strip() if resp and resp.text else ""
                        if text.startswith("```"):
                            text = re.sub(r"^```(?:json)?\n", "", text)
                            text = re.sub(r"\n```$", "", text)
                        parsed = json.loads(text)
                        return self._sanitize_dict(parsed)
                    except Exception:
                        continue
            return None
        except Exception as e:
            print(f"[AnalysisChain] Gemini execution error: {e}")
            return None

    def _build_prompt(self, lead_data: Dict[str, Any], signals: Dict[str, Any], custom_instructions: Optional[str], tone: str) -> str:
        return f"""Analyze this sales conversation:
Prospect: {lead_data.get('name')} ({lead_data.get('company')})
Email: {lead_data.get('email')}
Tone Requested: {tone}
Custom Rep Instructions: {custom_instructions or 'None'}

Conversation Thread:
{json.dumps(lead_data.get('thread', []), indent=2)}

Computed Signals:
{json.dumps(signals, indent=2)}

Return JSON with exactly these keys:
{{
  "urgency": <integer 1-10>,
  "urgency_level": <"Critical"|"High"|"Medium"|"Low">,
  "reason": "<one concise paragraph explaining why this prospect requires action>",
  "next_action": "<one specific sentence tactical next action>",
  "draft_subject": "<compelling contextual email subject>",
  "draft_message": "<personalized follow-up email body ready to send>"
}}"""

    def _heuristic_analysis(self, lead_data: Dict[str, Any], signals: Dict[str, Any], custom_instructions: Optional[str], tone: str) -> Dict[str, Any]:
        """Provides expert deterministic analysis and urgency scoring."""
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

        # Bound score between 1 and 10
        score = max(1, min(10, score))
        
        level = "Critical" if score >= 8.5 else ("High" if score >= 7.5 else ("Medium" if score >= 4 else "Low"))
        
        prospect_name = lead_data.get("name", "Prospect")
        company = lead_data.get("company", "Company")
        subject = lead_data.get("subject", "our discussion")
        
        reason_text = " ".join(reasons) if reasons else f"Recent message thread regarding '{subject[:60]}' with {prospect_name}."
        next_action_text = f"Send personalized follow-up to {prospect_name} regarding {subject[:50]}." if signals.get("last_sender_is_prospect") else f"Check in with {prospect_name} to confirm receipt and maintain momentum."

        name = prospect_name.split()[0]
        
        # Tone adjustments
        if tone == "Short & Direct":
            body = f"Hi {name},\n\nFollowing up on {subject}. Let me know if you are free for a brief sync tomorrow to discuss next steps.\n\nBest regards,\nSathwik"
        elif tone == "Warm & Friendly":
            body = f"Hi {name},\n\nHope your week is going great!\n\nI wanted to check in regarding {subject} and see how things are progressing on your side. Would love to answer any questions you might have.\n\nWarm regards,\nSathwik"
        elif tone == "Urgent / Action-Oriented":
            body = f"Hi {name},\n\nFollowing up right away on {subject} so we can keep things moving on schedule. Please let me know your availability for a quick call today.\n\nBest regards,\nSathwik"
        else:
            body = f"Hi {name},\n\nThank you for reaching out regarding {subject}.\n\nPlease let me know if you have any questions or if you'd like to schedule time this week to review next steps.\n\nBest regards,\nSathwik"

        if custom_instructions:
            body = f"Hi {name},\n\n{custom_instructions}\n\nLooking forward to hearing from you.\n\nBest regards,\nSathwik"

        return {
            "urgency": score,
            "urgency_level": level,
            "reason": reason_text,
            "next_action": next_action_text,
            "draft_subject": f"Re: {subject}",
            "draft_message": body,
            "signals": signals
        }

analysis_chain = AnalysisChain()
