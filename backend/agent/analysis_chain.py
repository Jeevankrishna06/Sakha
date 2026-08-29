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
            return {"response_lag_days": 0, "last_sender_is_prospect": False, "buying_intent": "Low"}

        last_msg = thread[-1]
        last_sender_is_prospect = not last_msg.get("is_outbound", False)
        
        # Combine all conversation text
        full_text = " ".join([m.get("body", "") for m in thread]).lower()
        
        # Pricing signal
        has_pricing = any(k in full_text for k in ["pricing", "cost", "quote", "rate", "discount", "budget", "$"])
        # Demo signal
        has_demo = any(k in full_text for k in ["demo", "walkthrough", "presentation", "screen share", "call"])
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
            "unanswered_promise": has_promise and last_sender_is_prospect,
            "thread_depth": len(thread)
        }

    def analyze_lead(self, lead_data: Dict[str, Any], custom_instructions: Optional[str] = None, tone: str = "Professional") -> Dict[str, Any]:
        """
        Runs full AI analysis on a prospect conversation.
        """
        signals = self.calculate_deterministic_signals(lead_data)
        prospect_name = lead_data.get("name", "Prospect")
        company = lead_data.get("company", "Company")
        
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
        
        prompt = f"""You are Sakha, an elite AI sales copilot. Answer the sales question accurately using only the provided email conversation context.

Context:
{formatted_context}

Question:
{query}

Provide a concise, direct, executive-ready sales summary with clear actionable next steps."""

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

        # Smart deterministic synthesis
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
                        temperature=0.3
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
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = self._build_prompt(lead_data, signals, custom_instructions, tone)
            resp = model.generate_content(prompt + "\n\nOutput strictly valid JSON with no markdown formatting.")
            text = resp.text.strip()
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\n", "", text)
                text = re.sub(r"\n```$", "", text)
            return json.loads(text)
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
            reasons.append("Unanswered promise detected in thread — immediate follow-up required.")
        elif signals.get("pricing_requested"):
            score += 2
            reasons.append("Prospect inquired about pricing or terms.")
        
        if signals.get("demo_mentioned"):
            score += 1
            reasons.append("Demo, presentation, or review call discussed.")

        if signals.get("last_sender_is_prospect"):
            score += 2
            reasons.append("Awaiting reply from our side.")
        else:
            score -= 1

        # Bound score between 1 and 10
        score = max(1, min(10, score))
        
        level = "Critical" if score >= 9 else ("High" if score >= 7 else ("Medium" if score >= 4 else "Low"))
        
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
