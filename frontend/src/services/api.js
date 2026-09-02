import { MOCK_LEADS } from '../data/mockData';

const BASE_URL = '/api';

function getActiveUserEmail() {
  try {
    const saved = localStorage.getItem('sakha_auth_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed?.email || '';
    }
  } catch (e) {
    // ignore
  }
  return '';
}

function getRequestHeaders(custom = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...custom
  };
  const email = getActiveUserEmail();
  if (email) {
    headers['X-User-Email'] = email;
  }
  return headers;
}

export const apiService = {
  // Fetch dashboard statistics for active user
  async getStats() {
    try {
      const res = await fetch(`${BASE_URL}/stats`, {
        headers: getRequestHeaders()
      });
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
      last_sync: 'Just now'
    };
  },

  // Fetch prioritized leads for active user
  async getLeads(urgencyMin = null, search = '') {
    try {
      let url = `${BASE_URL}/leads`;
      const params = new URLSearchParams();
      if (urgencyMin !== null) params.append('urgency_min', urgencyMin);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url, {
        headers: getRequestHeaders()
      });
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
      const res = await fetch(`${BASE_URL}/lead/${leadId}`, {
        headers: getRequestHeaders()
      });
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
        body: JSON.stringify({
          lead_id: leadId,
          tone,
          custom_instructions: customInstructions
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('[API] Backend draft error, using local generator:', e);
    }
    
    // Fallback if backend network fails
    const leads = await apiService.getLeads();
    const lead = leads.find(l => l.id === leadId) || { name: 'Contact', company: 'Company', subject: 'our discussion', draft: {} };
    const firstName = lead.name ? lead.name.split(' ')[0] : 'there';
    const cleanSubj = lead.subject ? lead.subject.replace(/^(Re|RE|Fwd|FWD):\s*/i, '') : 'our discussion';
    
    let body = "";
    if (tone === 'Short & Direct') {
      body = `Hi ${firstName},\n\nFollowing up on ${cleanSubj} for ${lead.company}.\n\nAre you free for a quick 5-minute sync tomorrow at 11:00 AM to review next steps?\n\nBest,\nJeevan Krishna\nTeam Sakha`;
    } else if (tone === 'Warm & Friendly') {
      body = `Hi ${firstName},\n\nHope you are having a wonderful week!\n\nI wanted to check in regarding our conversation on ${cleanSubj}. We would love to partner with ${lead.company} and make sure all your questions are answered.\n\nPlease let me know if you would like to jump on a quick call this week, or if I can share any additional details.\n\nWarm regards,\nJeevan Krishna\nTeam Sakha`;
    } else if (tone === 'Urgent / Action-Oriented') {
      body = `Hi ${firstName},\n\nFollowing up right away on ${cleanSubj} so we don't hold up your timeline for ${lead.company}.\n\nI have everything ready on our end—could we do a brief 10-minute call today or tomorrow morning to lock in next steps?\n\nBest regards,\nJeevan Krishna\nTeam Sakha`;
    } else if (tone === 'Executive / Concise') {
      body = `Hi ${firstName},\n\nTouching base on the ${cleanSubj} initiative for ${lead.company}.\n\nKey next step: finalize timeline & deliverables.\n\nLet me know if 15 minutes this Thursday works for your calendar.\n\nBest regards,\nJeevan Krishna\nTeam Sakha`;
    } else {
      body = `Hi ${firstName},\n\nThank you for your time regarding ${cleanSubj}.\n\nI am following up to review our discussion for ${lead.company} and address any questions your team may have as we move forward.\n\nPlease let me know your availability this week for a brief review session.\n\nBest regards,\nJeevan Krishna\nTeam Sakha`;
    }
    
    if (customInstructions) {
      body = `Hi ${firstName},\n\n${customInstructions}\n\nLooking forward to hearing from you.\n\nBest regards,\nJeevan Krishna\nTeam Sakha`;
    }

    return {
      subject: `Re: ${cleanSubj}`,
      recipient: lead.email || '',
      body,
      tone,
      urgency: lead.urgency || 5,
      reason: lead.reason || ''
    };
  },

  // RAG Chat Copilot Query
  async queryChat(query) {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: getRequestHeaders(),
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
      response: `Based on your recent indexed Gmail threads, **Rahul Sharma (Acme Tech)** and **Priya Mehta (TechNova)** require the most urgent follow-up today to maintain momentum on active deals.`,
      sources: [
        { lead_name: "Rahul Sharma", company: "Acme Technologies", date: "Aug 26, 2026", score: 0.89 },
        { lead_name: "Priya Mehta", company: "TechNova Solutions", date: "Aug 28, 2026", score: 0.87 }
      ]
    };
  },

  // Sync Inbox
  async syncInbox() {
    try {
      const res = await fetch(`${BASE_URL}/sync`, {
        method: 'POST',
        headers: getRequestHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Simulated sync.');
    }
    return {
      status: 'success',
      message: 'Conversation threads parsed, cleaned, and indexed in ChromaDB.',
      details: { leads_processed: 6, chunks_indexed: 18 }
    };
  },

  // Alias for syncInbox
  async triggerSync() {
    return this.syncInbox();
  },

  // Connect Gmail via IMAP (email + App Password)
  async connectGmail(email, appPassword) {
    try {
      const res = await fetch(`${BASE_URL}/gmail/connect`, {
        method: 'POST',
        headers: getRequestHeaders(),
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
      const res = await fetch(`${BASE_URL}/gmail/status`, {
        headers: getRequestHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Could not fetch Gmail status.');
    }
    return { authenticated: false, mode: 'Offline', auth_type: 'demo', email: '' };
  },

  // Get All Registered Accounts
  async getAccounts() {
    try {
      const res = await fetch(`${BASE_URL}/auth/users`, {
        headers: getRequestHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Could not fetch accounts list.');
    }
    return [];
  },

  // Remove account from registry
  async removeAccount(email) {
    try {
      const res = await fetch(`${BASE_URL}/auth/user?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: getRequestHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Could not remove account:', e);
    }
    return { success: false };
  },

  // Interactive Google Sign-In (OAuth 2.0)
  async loginWithGoogle(forceNew = false) {
    try {
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({ force_new: forceNew })
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.detail || 'Google Sign-in failed' };
    } catch (e) {
      console.warn('[API] Google auth network issue:', e);
      return { success: false, message: 'Could not connect to backend for Google OAuth.' };
    }
  },

  // Get Auth Status
  async getAuthStatus() {
    try {
      const res = await fetch(`${BASE_URL}/auth/status`, {
        headers: getRequestHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Auth status check error.');
    }
    return { authenticated: false, email: '', mode: 'demo' };
  },

  // Logout
  async logout() {
    try {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getRequestHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Logout error:', e);
    }
    return { success: true };
  }
};
