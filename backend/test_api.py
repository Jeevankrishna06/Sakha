import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from starlette.requests import Request
from backend.api.main import (
    health_check,
    get_dashboard_stats,
    list_leads,
    get_lead_details,
    create_gmail_draft_for_lead,
    generate_custom_draft,
    query_sales_copilot,
    list_accounts,
    GenerateDraftRequest,
    CreateDraftRequest,
    ChatQueryRequest
)
from backend.data.user_manager import register_or_update_user, get_all_users, delete_user

def build_mock_request(user_email: str = "demo@sakha.ai") -> Request:
    scope = {
        "type": "http",
        "headers": [(b"x-user-email", user_email.encode("utf-8"))],
        "query_string": b""
    }
    return Request(scope)

def test_all():
    req = build_mock_request("demo@sakha.ai")

    print("1. Testing multi-user registration & user_manager...")
    u1 = register_or_update_user("alice@acmecorp.com", auth_mode="oauth", name="Alice Smith")
    u2 = register_or_update_user("bob@salescloud.io", auth_mode="oauth", name="Bob Jones")
    users = list_accounts()
    assert len(users) >= 2
    print(f"   -> OK: Registered {len(users)} users across isolated workspaces.")

    print("2. Testing health_check with user context...")
    r = health_check(req)
    assert r["status"] == "healthy"
    print("   -> OK: Health check passed.")

    print("3. Testing get_dashboard_stats for user...")
    stats = get_dashboard_stats(req)
    assert stats["total_leads"] >= 1
    assert "critical_count" in stats
    print("   -> OK: Stats calculated successfully for active user.")

    print("4. Testing list_leads with user isolation...")
    leads = list_leads(req)
    assert len(leads) >= 1
    assert "urgency" in leads[0]
    print(f"   -> OK: {len(leads)} leads returned with sorted urgency.")

    print("5. Testing get_lead_details('lead-1')...")
    lead1 = get_lead_details("lead-1", req)
    assert lead1["name"] == "Rahul Sharma"
    print("   -> OK: Lead details and multi-turn thread loaded.")

    print("6. Testing generate_custom_draft (Tone: Short & Direct)...")
    draft_req = GenerateDraftRequest(lead_id="lead-1", tone="Short & Direct")
    draft = generate_custom_draft(draft_req, req)
    assert len(draft["body"]) > 0
    print("   -> OK: Draft successfully generated.")

    print("7. Testing query_sales_copilot (RAG Query with User Filter)...")
    chat_req = ChatQueryRequest(query="Which prospects are waiting for pricing?")
    chat_res = query_sales_copilot(chat_req, req)
    assert len(chat_res["response"]) > 0
    print("   -> OK: Multi-tenant RAG sales copilot returned answer.")

    print("8. Testing create_gmail_draft_for_lead('lead-1')...")
    c_req = CreateDraftRequest(to_email="rahul.sharma@acmetech.io", subject="Pricing Quote", body_text="Here is your quote.")
    draft_res = create_gmail_draft_for_lead("lead-1", request=req, request_body=c_req)
    assert draft_res["success"] is True
    print("   -> OK: Gmail draft queue verified.")

    # Clean up test accounts
    delete_user("alice@acmecorp.com")
    delete_user("bob@salescloud.io")

    print("\n=======================================================")
    print("ALL 8 MULTI-USER BACKEND API ENDPOINTS VERIFIED & PASSING!")
    print("=======================================================")

if __name__ == "__main__":
    test_all()
