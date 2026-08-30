<div align="center">

<img src="assets/logo.png" alt="Sakha AI Logo" width="160" style="border-radius: 24px; margin-bottom: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);" />

# ⚡ Sakha — AI Sales Follow-Up Agent
### *Your proactive AI sales companion that ensures no high-value lead is ever forgotten.*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![ChromaDB](https://img.shields.io/badge/Vector_DB-ChromaDB-orange.svg?style=for-the-badge)](https://www.trychroma.com/)
[![Embeddings](https://img.shields.io/badge/Embeddings-MiniLM--L6--v2%20(Local)-green.svg?style=for-the-badge)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
[![LLMs](https://img.shields.io/badge/LLM-Groq%20%7C%20Gemini-purple.svg?style=for-the-badge)](https://groq.com)

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deployment--evaluator-guide">Deployment Guide</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-gmail-setup-guide">Gmail Setup</a>
</p>

</div>

---

## 🧠 Why Sakha?

Sales representatives juggle dozens of active prospect conversations daily. Inboxes quickly become overwhelming:

- 💸 **Unanswered Pricing Inquiries:** A lead requests pricing, but the message gets buried under newsletters.
- 🤝 **Unfulfilled Commitments:** A salesperson promises to send a deck *"by tomorrow"*, but misses the deadline.
- ❄️ **Cold High-Value Leads:** A warm customer asking for a demo goes uncontacted for 5+ days.
- ⏳ **Information Overload:** Sifting through 1,000+ emails to figure out who needs attention is inefficient.

**Sakha solves this problem** by acting as an intelligent sales co-pilot. Connecting directly to your Gmail inbox, Sakha indexes email threads, extracts deterministic sales signals, scores urgency using hybrid RAG + LLM intelligence, and drafts tailored responses ready for your review.

> **Sakha answers three vital questions every morning:**
> 1. 🎯 **Who needs attention?** (Intelligent lead prioritization with 1–10 urgency scores)
> 2. 🔍 **Why do they need attention?** (Explainable context: pricing requested, promises unfulfilled, response lag)
> 3. 🚀 **What should I do next?** (Personalized action item and one-click Gmail draft generation)

---

## ✨ Key Features

### 1. 🎬 Zero-Auth Public Demo & Evaluator Flow
- **Instant Access:** Evaluators can explore Sakha immediately with rich, realistic B2B sales scenarios without logging in or providing Gmail credentials.
- **Deep-Link Gmail Compose:** One-click **"Draft Follow-up in Gmail"** opens Gmail web with **To**, **Subject**, and **Body** pre-filled—ready for review and manual send.
- **Standalone Static Mode:** The built frontend can be hosted independently on Vercel, Netlify, or Cloudflare Pages with zero backend dependencies.

### 2. 🔄 Dual Real-World Gmail Connection Modes
- **Simple IMAP + App Password:** Connect your Gmail in under 30 seconds without creating a Google Cloud project.
- **Google OAuth 2.0:** Enterprise-grade integration using official Google OAuth credentials (`credentials.json`).
- **Real Gmail Draft API:** Automatically creates drafts directly inside your Gmail account's Drafts box.

### 3. ⚡ Zero-Cost Local RAG (1000+ Email Capacity)
- **Local Embeddings:** Powered by `sentence-transformers/all-MiniLM-L6-v2` running entirely on your machine.
- **No External Embedding Cost:** Zero cost per token and zero rate-limit throttling during heavy inbox ingestion.
- **ChromaDB Vector Store:** Fast semantic search across conversation history with rich metadata filtering.

### 4. 🎯 Explainable Multi-Factor Urgency Scoring (1–10)
Combines **deterministic heuristic signals** with **LLM contextual reasoning**:
- 🏷️ **Pricing Inquiries:** Detects budget, quotes, and rate requests (`₹`, `$`, `pricing`, `quote`).
- 📅 **Meeting & Demo Intent:** Identifies demo requests, calendar links, and rescheduling attempts.
- ⏰ **Unanswered Promises:** Flags outbound commitments (*"I will send this tomorrow"*) awaiting delivery.
- ⏳ **Response Lag & Direction:** Tracks days since last prospect response and flags outbound vs. inbound state.

### 5. 🤖 Multi-Provider LLM Engine
- **Groq:** Ultra-fast inference with Llama 3 models for instant draft and score generation.
- **Google Gemini:** Advanced reasoning using Gemini 1.5 / 2.0 models.
- **Heuristic Fallback:** Offline deterministic rule engine ensures the system works even with no API keys.

### 6. ✍️ Personalized Follow-Up Studio (100% Human-in-the-Loop)
- Generates context-rich email drafts referencing past commitments and prospect inquiries.
- **Tone Customization:** Switch between *Professional*, *Casual*, *Urgent*, *Friendly*, or *Direct*.
- **Custom AI Directives:** Provide custom instructions to steer the draft content.
- **Guaranteed Human Review:** Sakha **never** sends emails automatically—you always review and click send.

### 7. 💬 RAG Sales Copilot (Natural Language Inbox Search)
- Ask natural language questions like: *"Which enterprise clients asked for SOC2 compliance?"* or *"Who wants a demo this week?"*
- Semantic retrieval surfaces exact email snippets along with lead source metadata and relevance scores.

### 8. 📡 Real-Time Live Sync & Server-Sent Events (SSE)
- Background sync monitors your inbox every 30 seconds.
- Live updates stream to the React UI via Server-Sent Events (`/stream/leads`), refreshing metrics without manual page reloads.

---

## 🏗️ Architecture

```
                               ┌─────────────────────────┐
                               │   Gmail Inbox / API     │
                               │   (IMAP or OAuth 2.0)   │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │     Ingestion Engine    │
                               │   • Clean & De-noise    │
                               │   • Thread Reconstruction│
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │  Local Embeddings Unit  │
                               │    (all-MiniLM-L6-v2)   │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │   ChromaDB Vector Store │
                               │  (Thread Chunks + Meta) │
                               └────────────┬────────────┘
                                            │
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │        Deterministic Signal Engine        │
                      │  • Pricing Ask  • Promise Check  • Lag    │
                      └─────────────────────┬─────────────────────┘
                                            │
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │          LLM Intelligence Agent           │
                      │       (Groq Llama 3 / Google Gemini)      │
                      └─────────────────────┬─────────────────────┘
                                            │
                      ┌─────────────────────┼─────────────────────┐
                      ▼                     ▼                     ▼
             Urgency Score (1-10)     Action Recommendation  Follow-Up Draft
                      │                     │                     │
                      └─────────────────────┼─────────────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │   FastAPI REST Backend  │
                               │   • SSE Stream Engine   │
                               │   • Draft Creation API  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ React + Tailwind UI     │
                               │ • Live Urgency Cards    │
                               │ • RAG Sales Copilot     │
                               │ • Draft Studio & Sync   │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ Human Reviews & Sends   │
                               │ • Direct Gmail Compose  │
                               │ • Real Gmail Draft API  │
                               └─────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 + Vite** | High-performance SPA with modern hooks and state management |
| **Styling** | **Tailwind CSS** | Custom responsive dashboard, dark/light aesthetics, glowing badges |
| **Icons** | **Lucide React** | Clean, accessible vector icons |
| **Backend API** | **FastAPI + Uvicorn** | Asynchronous Python REST API with SSE live event streaming |
| **Local Embeddings** | **Sentence Transformers** | `all-MiniLM-L6-v2` (384-dim, local CPU/GPU, zero API cost) |
| **Vector Database** | **ChromaDB** | Local persistent vector store with cosine similarity retrieval |
| **LLM Providers** | **Groq & Google Gemini** | High-speed Llama 3 inference + Gemini fallback |
| **Email Ingestion** | **IMAP / Gmail API** | Dual-mode email sync with HTML cleaner and thread parser |
| **Containerization** | **Docker** | Multi-stage build packaging frontend + backend into a single container |

---

## 📁 Project Structure

```text
Sakha/
├── assets/
│   ├── logo.png                     # Sakha brand identity asset
│   └── logo.jpeg                    # High-res logo
├── backend/
│   ├── agent/
│   │   └── analysis_chain.py        # Deterministic signals + LLM reasoning chain
│   ├── api/
│   │   └── main.py                  # FastAPI server, REST routes & SSE broadcaster
│   ├── data/
│   │   ├── demo_leads.py            # Pre-configured sales scenarios for offline demo
│   │   ├── leads_store.py           # In-memory and cached lead management
│   │   └── synced_leads_cache.json  # Cached lead state and thread history
│   ├── ingestion/
│   │   ├── chunker.py               # Email thread cleaner & semantic chunker
│   │   ├── gmail_pull.py            # Gmail client (OAuth 2.0 + IMAP app password)
│   │   └── run_pipeline.py          # End-to-end sync, ingestion & indexing pipeline
│   ├── rag/
│   │   ├── embed.py                 # Sentence Transformers local embedding engine
│   │   ├── retriever.py             # ChromaDB similarity search & context assembler
│   │   └── vector_store.py          # ChromaDB collection management
│   ├── config.py                    # Environment settings and configuration loader
│   └── test_api.py                  # Backend API test suite
├── frontend/
│   ├── dist/                        # Production build ready for static deployment
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConversationView.jsx # Email thread display with sender distinction
│   │   │   ├── DraftEditor.jsx      # Tone switcher, AI prompt customizer & Gmail compose
│   │   │   ├── LeadCard.jsx         # Urgency badge, signal tags & quick actions
│   │   │   ├── LeadDetailModal.jsx  # Complete lead profile, signals & analysis
│   │   │   ├── LeadFilters.jsx      # Search, urgency filters & sorting controls
│   │   │   ├── Navbar.jsx           # Live sync indicator, Copilot & Settings triggers
│   │   │   ├── RagChatModal.jsx     # Interactive RAG Sales Copilot chat modal
│   │   │   ├── SettingsModal.jsx    # Gmail connection modal (IMAP/OAuth) & LLM config
│   │   │   ├── StatsOverview.jsx    # Metric counters (Critical, High, Due Today)
│   │   │   └── Toast.jsx            # Action notifications
│   │   ├── data/
│   │   │   └── mockData.js          # Standalone client-side sales dataset
│   │   ├── services/
│   │   │   └── api.js               # API service with zero-backend fallback
│   │   ├── App.jsx                  # Main dashboard layout and state orchestration
│   │   ├── index.css                # Tailwind directives and custom animation utilities
│   │   └── main.jsx                 # React root renderer
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind design tokens
│   └── vite.config.js               # Vite bundler config
├── dockerfile                       # Multi-stage production container
├── .env.example                     # Environment variables template
├── requirements.txt                 # Backend Python dependencies
└── README.md                        # Documentation
```

---

## 🌐 Deployment & Evaluator Guide

### Option 1: Static Deployment (Vercel / Netlify / Cloudflare Pages) — *Recommended for Demo Link*
Deploy the standalone frontend with zero backend dependencies:
- **Deploy Directory:** `frontend/dist` (or set Root: `frontend`, Build Command: `npm run build`, Output: `dist`)
- **Drag-and-Drop:** Drag `frontend/dist` directly into [app.netlify.com/drop](https://app.netlify.com/drop).
- **Behavior:** Loads the curated demo workspace instantly, supports tone switching, Copilot semantic search, and direct Gmail compose deep-linking.

### Option 2: Docker Container (Fullstack All-in-One)
Build and run the entire unified stack (Frontend + FastAPI Backend + ChromaDB) in one container:
```bash
# Build the Docker image
docker build -t sakha-app .

# Run the container
docker run -d -p 8000:8000 --name sakha sakha-app
```
> Open `http://localhost:8000` to access the full-stack app.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- *(Optional)* [Groq API Key](https://console.groq.com) or [Google Gemini API Key](https://aistudio.google.com)

---

### Step 1: Clone & Setup

```bash
git clone https://github.com/Jeevankrishna06/Sakha.git
cd Sakha
```

---

### Step 2: Backend Setup

1. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the Backend API:**
   ```bash
   uvicorn backend.api.main:app --reload --port 8000
   ```
   > 💡 API documentation is available at `http://127.0.0.1:8000/docs`.

---

### Step 3: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
> 🌐 Open `http://localhost:5173` to explore the dashboard.

---

## 🔑 Gmail Setup Guide

Sakha supports two connection methods:

### Option A: Gmail App Password (Recommended — 1-Minute Setup)
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is enabled.
3. Search for **App Passwords** (or visit [Google App Passwords](https://myaccount.google.com/apppasswords)).
4. Create an app named `Sakha` and copy the 16-character password generated.
5. In the Sakha Dashboard, click **Settings** ⚙️ ➔ enter your email & App Password ➔ click **Connect & Ingest**.

### Option B: Google Cloud OAuth 2.0
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project, enable the **Gmail API**, and configure the **OAuth consent screen** (Testing mode).
3. Create **OAuth Client ID** credentials (Desktop Application) and download `credentials.json`.
4. Place `credentials.json` in the root folder of the project.
5. Ingesting will authenticate via your browser.

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Returns server health, LLM engine status, and Gmail connection state |
| `GET` | `/stats` | Returns aggregate metrics: total leads, critical/high counts, due today |
| `GET` | `/leads` | Lists prioritized prospects sorted by urgency score (`urgency_min`, `search` filters) |
| `GET` | `/lead/{id}` | Fetches full lead profile, deterministic signal breakdown, and thread history |
| `POST` | `/sync` | Triggers manual inbox ingestion, cleaning, embedding, and re-indexing |
| `POST` | `/draft/generate` | Regenerates an AI draft with custom tone (*Casual*, *Urgent*, *Direct*, etc.) |
| `POST` | `/draft/{id}` | Creates a real draft in the user's Gmail Drafts box |
| `POST` | `/chat` | Queries the RAG Sales Copilot over all indexed conversation chunks |
| `POST` | `/gmail/connect` | Connects Gmail account via IMAP credentials and starts ingestion |
| `GET` | `/gmail/status` | Returns active Gmail authentication status and user email |
| `GET` | `/stream/leads` | Server-Sent Events (SSE) endpoint for real-time live lead push updates |

---

## 🛡️ Privacy & Human-in-the-Loop Safeguards

- **Local Vector Processing:** Conversation embeddings are computed locally using MiniLM—your raw conversation vectors stay on your machine.
- **No Autonomous Sending:** Sakha only creates drafts or deep-links to Gmail's compose screen. A human sales representative always retains final editorial review and sending authorization.
- **Granular Control:** Reps can adjust the tone, customize directives, or freely edit the generated draft body prior to saving.

---

## 👥 Team Sakha

Built with ❤️ by **Team Sakha** during a **24-Hour Hackathon**.

> **"You focus on closing deals. Sakha remembers the follow-up."**

---

## ⭐ Support & Feedback

If you find Sakha useful for your sales workflow, please give this repository a **Star ⭐** on GitHub!
