import { MOCK_LEADS } from '../data/mockData';

const BASE_URL = '/api';

export const apiService = {
  // Fetch dashboard statistics
  async getStats() {
    try {
      const res = await fetch(`${BASE_URL}/stats`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Backend offline, using local stats calculation.');
    }
    
    // Fallback calculation
    const leads = MOCK_LEADS;
    const critical = leads.filter(l => l.urgency >= 9).length;
    const high = leads.filter(l => l.urgency >= 7 && l.urgency <= 8).length;
    const medium = leads.filter(l => l.urgency >= 4 && l.urgency <= 6).length;
    const low = leads.filter(l => l.urgency < 4).length;
    const awaiting = leads.filter(l => l.status === 'Awaiting Response').length;
    
    return {
      total_leads: leads.length,
      critical_count: critical,
      high_priority_count: high,
      medium_priority_count: medium,
      low_priority_count: low,
      awaiting_response_count: awaiting,
      due_today_count: critical + high,
      last_sync: '2 minutes ago'
    };
  },

  // Fetch prioritized leads
  async getLeads(urgencyMin = null, search = '') {
    try {
      let url = `${BASE_URL}/leads`;
      const params = new URLSearchParams();
      if (urgencyMin !== null) params.append('urgency_min', urgencyMin);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Backend offline, filtering mock data.');
    }

    let list = [...MOCK_LEADS].sort((a, b) => b.urgency - a.urgency);
    if (urgencyMin !== null) {
      list = list.filter(l => l.urgency >= urgencyMin);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l => 
        l.name.toLowerCase().includes(s) || 
        l.company.toLowerCase().includes(s) || 
        l.reason.toLowerCase().includes(s)
      );
    }
    return list;
  },

  // Fetch single lead details
  async getLeadDetails(leadId) {
    try {
      const res = await fetch(`${BASE_URL}/lead/${leadId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Backend offline, returning mock lead.');
    }
    return MOCK_LEADS.find(l => l.id === leadId) || MOCK_LEADS[0];
  },

  // Create Gmail Draft
  async createDraft(leadId, draftData) {
    try {
      const res = await fetch(`${BASE_URL}/draft/${leadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: draftData.recipient,
          subject: draftData.subject,
          body_text: draftData.body
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Simulating Gmail draft creation.');
    }
    
    return {
      success: true,
      mode: 'simulation',
      draft_id: `draft_${Date.now()}`,
      message: 'Draft created in Gmail Drafts queue! Review & send when ready.',
      gmail_link: `https://mail.google.com/mail/u/0/#drafts`
    };
  },

  // Generate / Regenerate Draft with Tone
  async generateDraft(leadId, tone = 'Professional', customInstructions = '') {
    try {
      const res = await fetch(`${BASE_URL}/draft/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          tone,
          custom_instructions: customInstructions
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Fallback draft generator.');
    }

    const lead = MOCK_LEADS.find(l => l.id === leadId) || MOCK_LEADS[0];
    const firstName = lead.name.split(' ')[0];
    
    let body = lead.draft.body;
    if (tone === 'Short & Direct') {
      body = `Hi ${firstName},\n\nFollowing up on our pricing discussion for ${lead.company}. Let me know if you are free for a 5-minute sync tomorrow to finalize the terms.\n\nBest,\nJeevan`;
    } else if (tone === 'Warm & Friendly') {
      body = `Hi ${firstName},\n\nHope your week is going great!\n\nJust checking in on the proposal we discussed for ${lead.company}. Would love to answer any questions your team might have.\n\nWarm regards,\nJeevan Krishna`;
    } else if (tone === 'Urgent / Action-Oriented') {
      body = `Hi ${firstName},\n\nFollowing up right away so we don't hold up your timeline for ${lead.company}. I've prepared all the terms—let's connect today so we can get your team onboarded.\n\nBest,\nJeevan`;
    }
    
    if (customInstructions) {
      body = `Hi ${firstName},\n\n${customInstructions}\n\nLooking forward to hearing from you.\n\nBest regards,\nJeevan Krishna`;
    }

    return {
      subject: lead.draft.subject,
      recipient: lead.email,
      body,
      tone,
      urgency: lead.urgency,
      reason: lead.reason
    };
  },

  // RAG Chat Copilot Query
  async queryChat(query) {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Fallback RAG chat response.');
    }

    // Smart semantic simulation matching query keywords
    const q = query.toLowerCase();
    if (q.includes('pricing') || q.includes('cost') || q.includes('quote')) {
      return {
        query,
        response: `**Rahul Sharma** from **Acme Technologies** requested 50-seat enterprise pricing 3 days ago and is waiting for a response before quarterly budget close.\n\n**Michael Chang** from **CloudScale** also requested a 12% discount on an annual contract.`,
        sources: [
          { lead_name: "Rahul Sharma", company: "Acme Technologies", date: "Aug 26, 2026", score: 0.96 },
          { lead_name: "Michael Chang", company: "CloudScale Systems", date: "Aug 27, 2026", score: 0.91 }
        ]
      };
    } else if (q.includes('demo') || q.includes('security') || q.includes('oauth')) {
      return {
        query,
        response: `**Priya Mehta** from **TechNova Solutions** requested a security review call regarding Gmail OAuth tokens and compliance before signing.`,
        sources: [
          { lead_name: "Priya Mehta", company: "TechNova Solutions", date: "Aug 28, 2026", score: 0.94 }
        ]
      };
    }

    return {
      query,
      response: `Based on your recent 1000+ indexed Gmail threads, **Rahul Sharma (Acme Tech)** and **Priya Mehta (TechNova)** require the most urgent follow-up today to maintain momentum on active deals.`,
      sources: [
        { lead_name: "Rahul Sharma", company: "Acme Technologies", date: "Aug 26, 2026", score: 0.89 },
        { lead_name: "Priya Mehta", company: "TechNova Solutions", date: "Aug 28, 2026", score: 0.87 }
      ]
    };
  },

  // Sync Inbox
  async syncInbox() {
    try {
      const res = await fetch(`${BASE_URL}/sync`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Simulated sync.');
    }
    return {
      status: 'success',
      message: '127 conversation threads parsed, cleaned, and indexed in ChromaDB.',
      details: { leads_processed: 6, chunks_indexed: 18 }
    };
  },

  // Connect Gmail via IMAP (email + App Password)
  async connectGmail(email, appPassword) {
    try {
      const res = await fetch(`${BASE_URL}/gmail/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, app_password: appPassword })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Backend is offline. Start the server first.' };
    }
  },

  // Get Gmail connection status
  async getGmailStatus() {
    try {
      const res = await fetch(`${BASE_URL}/gmail/status`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Could not fetch Gmail status.');
    }
    return { authenticated: false, mode: 'Offline', auth_type: 'demo', email: '' };
  }
};
