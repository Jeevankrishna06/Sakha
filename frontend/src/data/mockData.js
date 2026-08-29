export const MOCK_LEADS = [
  {
    id: "lead-1",
    name: "Rahul Sharma",
    company: "Acme Technologies",
    role: "VP of Engineering",
    email: "rahul.sharma@acmetech.io",
    urgency: 9,
    urgency_level: "Critical",
    last_contact: "3 days ago",
    last_contact_date: "2026-08-26T14:30:00Z",
    category: "Pricing Request",
    status: "Awaiting Response",
    deal_size: "$48,000 / yr",
    reason: "Prospect requested pricing 3 days ago after a successful demo. Sales rep promised a quote 'by tomorrow morning' but never sent it. Rahul sent an urgent follow-up asking for updates.",
    next_action: "Follow up immediately with the customized 50-seat pricing breakdown and apologize for the delay.",
    signals: {
      buying_intent: "Very High",
      unanswered_promise: true,
      response_lag_days: 3,
      pricing_requested: true,
      demo_completed: true
    },
    draft: {
      subject: "Re: Sakha Enterprise Pricing & Next Steps",
      recipient: "rahul.sharma@acmetech.io",
      body: "Hi Rahul,\n\nI sincerely apologize for the delay in getting this over to you—I was finalizing our enterprise volume tier for your 50-seat team.\n\nAttached is the detailed pricing proposal we discussed, including dedicated support and local RAG indexing. Based on our demo last week, the Growth Enterprise plan at $48k/yr will cover all your requirements.\n\nAre you available for a brief 10-minute check-in tomorrow at 2 PM to walk through the terms?\n\nBest regards,\nJeevan Krishna\nTeam Sakha",
      tone: "Professional"
    },
    thread: [
      {
        id: "msg-101",
        sender: "Rahul Sharma",
        sender_email: "rahul.sharma@acmetech.io",
        is_outbound: false,
        date: "Aug 22, 2026 at 10:15 AM",
        snippet: "We really enjoyed the demo presentation yesterday. Our team has a few questions regarding pricing...",
        body: "Hi Jeevan,\n\nWe really enjoyed the demo presentation yesterday. Our engineering leads were particularly impressed by the local MiniLM embedding indexing.\n\nCould you please send over the pricing breakdown for an initial 50-seat deployment with enterprise SLA?\n\nThanks,\nRahul Sharma\nVP of Engineering, Acme Technologies"
      },
      {
        id: "msg-102",
        sender: "Jeevan Krishna (You)",
        sender_email: "jeevan@sakha.ai",
        is_outbound: true,
        date: "Aug 22, 2026 at 11:30 AM",
        snippet: "Glad to hear the team liked the architecture! I'll put together the custom quote and share it by tomorrow morning...",
        body: "Hi Rahul,\n\nGlad to hear the team liked the architecture! I'll put together the custom 50-seat quote with enterprise SLA and share it with you by tomorrow morning.\n\nBest,\nJeevan"
      },
      {
        id: "msg-103",
        sender: "Rahul Sharma",
        sender_email: "rahul.sharma@acmetech.io",
        is_outbound: false,
        date: "Aug 26, 2026 at 2:30 PM",
        snippet: "Hi Jeevan, checking in to see if you have the pricing numbers ready? We are finalizing budget allocations this Friday...",
        body: "Hi Jeevan,\n\nChecking in to see if you have the pricing numbers ready? We are finalizing our quarterly budget allocations this Friday and need the quote to include Sakha in the proposal.\n\nBest,\nRahul"
      }
    ]
  },
  {
    id: "lead-2",
    name: "Priya Mehta",
    company: "TechNova Solutions",
    role: "Head of Sales Operations",
    email: "priya.mehta@technova.com",
    urgency: 8,
    urgency_level: "High",
    last_contact: "1 day ago",
    last_contact_date: "2026-08-28T09:45:00Z",
    category: "Demo Follow-Up",
    status: "Action Required",
    deal_size: "$32,000 / yr",
    reason: "Prospect requested a technical deep-dive demo with their security officer to verify Gmail OAuth token handling.",
    next_action: "Share the security whitepaper and propose 2 time slots for a 20-minute security review call.",
    signals: {
      buying_intent: "High",
      unanswered_promise: false,
      response_lag_days: 1,
      pricing_requested: false,
      security_review: true
    },
    draft: {
      subject: "Re: Security & OAuth Architecture for TechNova Team",
      recipient: "priya.mehta@technova.com",
      body: "Hi Priya,\n\nThanks for reaching out! We take Gmail token security very seriously—tokens are encrypted using AES-256 and stored locally in ChromaDB without passing raw inbox data to external servers.\n\nI have attached our SOC2 Type II summary and OAuth security whitepaper. Would Thursday at 11:00 AM or Friday at 3:00 PM work for a 20-minute call with your security officer?\n\nBest regards,\nJeevan Krishna",
      tone: "Warm & Professional"
    },
    thread: [
      {
        id: "msg-201",
        sender: "Priya Mehta",
        sender_email: "priya.mehta@technova.com",
        is_outbound: false,
        date: "Aug 27, 2026 at 4:10 PM",
        snippet: "Our sales reps loved the follow-up draft accuracy in your prototype...",
        body: "Hi Jeevan,\n\nOur sales reps loved the follow-up draft accuracy in your prototype. Before we move to procurement, our CISO needs a quick architecture review regarding Gmail OAuth permissions and local token storage.\n\nDo you have documentation or time for a brief security sync this week?\n\nBest,\nPriya Mehta"
      },
      {
        id: "msg-202",
        sender: "Priya Mehta",
        sender_email: "priya.mehta@technova.com",
        is_outbound: false,
        date: "Aug 28, 2026 at 9:45 AM",
        snippet: "Also, can you confirm whether email bodies ever get used for training third-party models?",
        body: "Hi Jeevan,\n\nFollowing up on my previous note—also, can you confirm whether email bodies ever get used for training third-party models? That's a hard requirement for our compliance.\n\nThanks,\nPriya"
      }
    ]
  },
  {
    id: "lead-3",
    name: "Michael Chang",
    company: "CloudScale Systems",
    role: "Director of Product Management",
    email: "m.chang@cloudscale.net",
    urgency: 7,
    urgency_level: "High",
    last_contact: "2 days ago",
    last_contact_date: "2026-08-27T17:15:00Z",
    category: "Contract Negotiation",
    status: "Awaiting Response",
    deal_size: "$75,000 / yr",
    reason: "Prospect requested a 12% discount for an annual upfront payment and asked if multi-region vector storage is included.",
    next_action: "Confirm annual payment discount approval and provide revised agreement for digital signature.",
    signals: {
      buying_intent: "Very High",
      unanswered_promise: true,
      response_lag_days: 2,
      pricing_requested: true,
      contract_phase: true
    },
    draft: {
      subject: "Re: CloudScale & Sakha Annual Agreement & Terms",
      recipient: "m.chang@cloudscale.net",
      body: "Hi Michael,\n\nGreat news—our leadership has approved the 12% annual upfront incentive for CloudScale! Multi-region ChromaDB replication is fully covered under your Enterprise tier at no extra cost.\n\nI have updated the order form here for your review. Let me know if you'd like to initiate DocuSign today so we can begin onboarding your team next Monday.\n\nBest,\nJeevan Krishna",
      tone: "Action-Oriented"
    },
    thread: [
      {
        id: "msg-301",
        sender: "Michael Chang",
        sender_email: "m.chang@cloudscale.net",
        is_outbound: false,
        date: "Aug 25, 2026 at 11:00 AM",
        snippet: "We reviewed the MSA. If we commit to 2 years with annual upfront payment, can you offer a 12% discount?",
        body: "Hi Jeevan,\n\nWe reviewed the MSA with our legal team. If we commit to 2 years with annual upfront payment, can you offer a 12% discount? Also need confirmation that multi-region ChromaDB storage is included without additional surcharge.\n\nLooking forward to closing this out.\n\nMichael"
      },
      {
        id: "msg-302",
        sender: "Jeevan Krishna (You)",
        sender_email: "jeevan@sakha.ai",
        is_outbound: true,
        date: "Aug 25, 2026 at 1:15 PM",
        snippet: "Thanks Michael. Let me check with finance on the 12% discount structure and get back to you shortly...",
        body: "Thanks Michael. Let me check with finance on the 12% discount structure and get back to you shortly.\n\nBest,\nJeevan"
      },
      {
        id: "msg-303",
        sender: "Michael Chang",
        sender_email: "m.chang@cloudscale.net",
        is_outbound: false,
        date: "Aug 27, 2026 at 5:15 PM",
        snippet: "Any update on the finance approval? We want to sign before month end.",
        body: "Hi Jeevan,\n\nAny update on the finance approval? We want to sign before month end so we can align our Q3 rollouts.\n\nThanks,\nMichael"
      }
    ]
  },
  {
    id: "lead-4",
    name: "Sarah Jenkins",
    company: "FinServe Global",
    role: "Chief Revenue Officer",
    email: "sarah.j@finserve.org",
    urgency: 6,
    urgency_level: "Medium",
    last_contact: "4 days ago",
    last_contact_date: "2026-08-25T11:20:00Z",
    category: "Follow-Up Due",
    status: "Follow-Up Scheduled",
    deal_size: "$24,000 / yr",
    reason: "Sarah mentioned they were auditing internal sales workflows this week and asked to reconnect mid-week.",
    next_action: "Send a friendly check-in highlighting how Sakha reduces SDR follow-up response lag by 80%.",
    signals: {
      buying_intent: "Medium",
      unanswered_promise: false,
      response_lag_days: 4,
      pricing_requested: false,
      scheduled_checkin: true
    },
    draft: {
      subject: "Checking in: Streamlining FinServe's Sales Follow-Ups",
      recipient: "sarah.j@finserve.org",
      body: "Hi Sarah,\n\nHope your week is going well!\n\nAs you evaluate your sales team's Q3 workflows, I wanted to share a quick metric: teams using Sakha's automated RAG follow-up drafts cut missed prospect follow-ups by over 80% in their first month.\n\nWould you have 15 minutes this Friday or early next week to discuss what a pilot for FinServe would look like?\n\nWarmly,\nJeevan Krishna",
      tone: "Warm & Consultative"
    },
    thread: [
      {
        id: "msg-401",
        sender: "Sarah Jenkins",
        sender_email: "sarah.j@finserve.org",
        is_outbound: false,
        date: "Aug 20, 2026 at 3:00 PM",
        snippet: "We are currently auditing our CRM and email follow-up response times...",
        body: "Hi Jeevan,\n\nWe are currently auditing our CRM and email follow-up response times across our 25 SDRs. Ping me in the middle of next week once we finish our internal audit.\n\nSarah"
      },
      {
        id: "msg-402",
        sender: "Jeevan Krishna (You)",
        sender_email: "jeevan@sakha.ai",
        is_outbound: true,
        date: "Aug 20, 2026 at 3:45 PM",
        snippet: "Sounds great Sarah. I will reach out mid next week. Good luck with the audit!",
        body: "Sounds great Sarah. I will reach out mid next week. Good luck with the audit!\n\nBest,\nJeevan"
      }
    ]
  },
  {
    id: "lead-5",
    name: "David Kim",
    company: "Nexus Labs",
    role: "Founder & CEO",
    email: "david@nexuslabs.co",
    urgency: 4,
    urgency_level: "Medium",
    last_contact: "5 days ago",
    last_contact_date: "2026-08-24T16:00:00Z",
    category: "Feature Inquiry",
    status: "In Nurturing",
    deal_size: "$12,000 / yr",
    reason: "David inquired about n8n webhook automation support. Sales team answered, waiting for David's team to test.",
    next_action: "Send a lightweight nudge with our n8n starter template workflow JSON to help them test.",
    signals: {
      buying_intent: "Medium",
      unanswered_promise: false,
      response_lag_days: 5,
      pricing_requested: false,
      waiting_on_prospect: true
    },
    draft: {
      subject: "n8n Workflow Template for Nexus Labs",
      recipient: "david@nexuslabs.co",
      body: "Hi David,\n\nFollowing up on your question about n8n integration—I put together an easy starter workflow template that triggers Sakha email ingestion automatically every 2 hours.\n\nYou can import it into your n8n workspace with one click. Let me know if your developers have any questions getting it set up!\n\nBest,\nJeevan Krishna",
      tone: "Helpful & Direct"
    },
    thread: [
      {
        id: "msg-501",
        sender: "David Kim",
        sender_email: "david@nexuslabs.co",
        is_outbound: false,
        date: "Aug 23, 2026 at 2:00 PM",
        snippet: "Can we trigger Sakha analysis using our existing n8n automations?",
        body: "Hi team, does Sakha support webhook triggers via n8n for real-time lead updates? We use n8n for all our CRM syncs.\n\nDavid"
      },
      {
        id: "msg-502",
        sender: "Jeevan Krishna (You)",
        sender_email: "jeevan@sakha.ai",
        is_outbound: true,
        date: "Aug 24, 2026 at 4:00 PM",
        snippet: "Yes absolutely! We have native REST API endpoints that integrate with n8n HTTP Request nodes...",
        body: "Hi David, yes absolutely! We have native REST API endpoints (e.g. POST /sync and GET /leads) that hook directly into n8n HTTP Request nodes.\n\nBest,\nJeevan"
      }
    ]
  },
  {
    id: "lead-6",
    name: "Elena Rostova",
    company: "Vanguard Media Group",
    role: "VP of Growth",
    email: "elena.r@vanguardmedia.com",
    urgency: 3,
    urgency_level: "Low",
    last_contact: "8 days ago",
    last_contact_date: "2026-08-21T10:00:00Z",
    category: "Cold / Re-Engagement",
    status: "Cold Re-Engagement",
    deal_size: "$18,000 / yr",
    reason: "Elena engaged in initial discovery 2 weeks ago but went silent after receiving general product specs.",
    next_action: "Send a short, value-driven re-engagement note sharing a recent case study relevant to media outreach.",
    signals: {
      buying_intent: "Low",
      unanswered_promise: false,
      response_lag_days: 8,
      pricing_requested: false,
      cold_lead: true
    },
    draft: {
      subject: "Quick idea for Vanguard Media's sales follow-up rate",
      recipient: "elena.r@vanguardmedia.com",
      body: "Hi Elena,\n\nI know how busy things get leading up to Q4. I noticed Vanguard Media is rapidly scaling outreach across your content division.\n\nWe recently helped a similar high-volume media team automate their Gmail prospect prioritization without adding manual data entry. Thought of your team immediately.\n\nWould you be open to a 5-minute sync next Tuesday to see if this is relevant for your roadmap?\n\nBest,\nJeevan Krishna",
      tone: "Short & Direct"
    },
    thread: [
      {
        id: "msg-601",
        sender: "Elena Rostova",
        sender_email: "elena.r@vanguardmedia.com",
        is_outbound: false,
        date: "Aug 15, 2026 at 11:30 AM",
        snippet: "Thanks for the intro. Could you send over a high-level overview of the platform capabilities?",
        body: "Hi Jeevan, thanks for the intro. Could you send over a high-level overview of the platform capabilities? We're exploring options for our reps.\n\nElena"
      },
      {
        id: "msg-602",
        sender: "Jeevan Krishna (You)",
        sender_email: "jeevan@sakha.ai",
        is_outbound: true,
        date: "Aug 15, 2026 at 2:00 PM",
        snippet: "Hi Elena, attached is the overview document covering Sakha RAG architecture...",
        body: "Hi Elena, attached is the overview document covering Sakha RAG architecture and Gmail integration. Let me know what you think!\n\nBest,\nJeevan"
      }
    ]
  }
];
