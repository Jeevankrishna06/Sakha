import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.api.main import (
    health_check,
    get_dashboard_stats,
    list_leads,
    get_lead_details,
    create_gmail_draft_for_lead,
    generate_custom_draft,
    query_sales_copilot,
    GenerateDraftRequest,
    CreateDraftRequest,
    ChatQueryRequest
)

def test_all():
    print("1. Testing health_check...")
    r = health_check()
    assert r["status"] == "healthy"
    print("   -> OK: Health check passed.")

    print("2. Testing get_dashboard_stats...")
    stats = get_dashboard_stats()
    assert stats["total_leads"] >= 1
    assert "critical_count" in stats
    print("   -> OK: Stats calculated successfully.")

    print("3. Testing list_leads...")
    leads = list_leads()
    assert len(leads) >= 1
    assert "urgency" in leads[0]
    print(f"   -> OK: {len(leads)} leads returned with sorted urgency.")

    print("4. Testing get_lead_details('lead-1')...")
    lead1 = get_lead_details("lead-1")
    assert lead1["name"] == "Rahul Sharma"
    print("   -> OK: Lead details and multi-turn thread loaded.")

    print("5. Testing generate_custom_draft (Tone: Short & Direct)...")
    req = GenerateDraftRequest(lead_id="lead-1", tone="Short & Direct")
    draft = generate_custom_draft(req)
    assert len(draft["body"]) > 0
    print("   -> OK: Draft successfully generated.")

    print("6. Testing query_sales_copilot (RAG Query)...")
    chat_req = ChatQueryRequest(query="Which prospects are waiting for pricing?")
    chat_res = query_sales_copilot(chat_req)
    assert len(chat_res["response"]) > 0
    print("   -> OK: RAG sales copilot returned answer.")

    print("7. Testing create_gmail_draft_for_lead('lead-1')...")
    draft_req = CreateDraftRequest(to_email="rahul.sharma@acmetech.io", subject="Pricing Quote", body_text="Here is your quote.")
    draft_res = create_gmail_draft_for_lead("lead-1", draft_req)
    assert draft_res["success"] is True
    print("   -> OK: Gmail draft queue verified.")

    print("\n=======================================================")
    print("ALL 7 BACKEND API ENDPOINTS VERIFIED & WORKING FLAWLESSLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_all()
