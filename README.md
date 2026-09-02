# Sakha — AI Sales Follow-Up Agent

> **Your AI sales companion that makes sure no lead gets forgotten.**

Sakha is an AI-powered sales follow-up agent that connects with Gmail, understands sales conversations, identifies prospects who need attention, recommends the next best action, and generates personalized follow-up drafts.

<<<<<<< HEAD
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
=======
Built by **Team Sakha** during a **24-hour hackathon**.
>>>>>>> parent of 5f907c4 (updated README file)

---

## 🧠 What is Sakha?

Sales representatives interact with multiple prospects every day.

Emails pile up. Conversations get buried. Follow-ups get delayed.

And sometimes, a promising lead simply gets forgotten.

Sakha is designed to solve that problem.

Instead of asking a salesperson to manually search through hundreds of conversations, Sakha analyzes the inbox and answers three simple questions:

> **Who needs attention?**
> **Why do they need attention?**
> **What should I do next?**

---

## 🎯 The Problem

<<<<<<< HEAD
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
=======
A typical sales representative may have hundreds or even thousands of emails.

Important signals can easily get lost:

* A prospect asked for pricing.
* A customer requested a demo.
* Someone is waiting for a promised response.
* A prospect followed up but never received an answer.
* A potentially high-value lead has gone cold.

The problem isn't a lack of information.

**The problem is finding the right information at the right time.**
>>>>>>> parent of 5f907c4 (updated README file)

---

## 💡 The Sakha Approach

<<<<<<< HEAD
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
=======
Sakha connects to Gmail and uses **Retrieval-Augmented Generation (RAG)** to understand sales conversations.
>>>>>>> parent of 5f907c4 (updated README file)

It doesn't simply ask an LLM to read every email.

<<<<<<< HEAD
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
=======
Instead, Sakha:

```text
Gmail
   ↓
Email Threads
   ↓
Clean & Chunk
   ↓
Local Embeddings
   ↓
ChromaDB
   ↓
Retrieve Relevant Context
   ↓
AI Sales Analysis
   ↓
Prioritize Lead
   ↓
Recommend Next Action
   ↓
Generate Follow-Up
   ↓
Create Gmail Draft
>>>>>>> parent of 5f907c4 (updated README file)
```

---

<<<<<<< HEAD
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
=======
# ✨ Features

## 📧 Gmail Integration

Sakha connects to Gmail using OAuth and retrieves real email conversations.

It works with **email threads** instead of treating every email as an isolated message.

This allows Sakha to understand the context of the entire conversation.

---

## 🧠 RAG-Powered Conversation Understanding

Sakha uses Retrieval-Augmented Generation to retrieve relevant parts of a prospect's conversation before asking the LLM to analyze it.

For example:

```text
Prospect:
"Can you send me the pricing?"

Salesperson:
"Sure, I'll send it tomorrow."

Prospect:
"Any update on the pricing?"
```

Instead of looking only at the last message, Sakha can retrieve the relevant conversation history and understand:

> The prospect is waiting for information that was promised but hasn't been delivered.

---

## 🎯 Intelligent Lead Prioritization

Sakha assigns an urgency score to prospects.

The analysis can consider signals such as:

* Time since last contact
* Whether the prospect is waiting for a response
* Buying intent
* Pricing requests
* Demo requests
* Unanswered questions
* Follow-up promises
* Conversation history

Example:

```text
┌────────────────────────────────────────┐
│ Rahul Sharma                    9/10   │
│ Acme Technologies                      │
│                                        │
│ Last contact: 3 days ago               │
│                                        │
│ Reason:                                │
│ Prospect requested pricing and         │
│ is waiting for a response.             │
│                                        │
│ Next Action:                           │
│ Follow up today with pricing.          │
└────────────────────────────────────────┘
```

---

## 🔎 Local Embeddings

Sakha uses:

```text
all-MiniLM-L6-v2
```

through Sentence Transformers.

Embeddings are generated **locally** instead of relying on an external embedding API.

This provides two major advantages:

* No embedding API cost
* No embedding API rate-limit dependency

This is particularly useful for processing **1000+ emails**.

---

## ✍️ Personalized Follow-Up Generation

Sakha generates follow-up messages using the actual conversation context.

The goal is not to produce another generic:

> "Hi, just following up..."

Instead, the generated message should reflect:

* What the prospect asked
* What was previously discussed
* What the salesperson promised
* What needs to happen next

---

## 📬 Gmail Drafts — Human in the Loop

Sakha **does not automatically send emails**.

Instead:

```text
AI Analysis
     ↓
Recommended Action
     ↓
Generate Draft
     ↓
Human Reviews
     ↓
Human Edits if Necessary
     ↓
Human Sends
```

The final decision always remains with the salesperson.

---

## 📊 Prioritized Dashboard

The dashboard is designed around one question:

> **Who should I follow up with right now?**

It provides:

* Priority score
* Prospect information
* Last contact
* Reason for urgency
* Recommended action
* Conversation history
* Follow-up draft

---

# 🏗️ Architecture

```text
                         ┌───────────────┐
                         │   Gmail API   │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   Ingestion   │
                         │    Python     │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ Clean & Chunk │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   Embeddings  │
                         │  MiniLM Local │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   ChromaDB    │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ RAG Retrieval │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   AI Agent    │
                         │ Groq / Gemini │
                         └───────┬───────┘
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
              Urgency       Next Action       Draft
                  │              │              │
                  └──────────────┼──────────────┘
                                 ▼
                         ┌───────────────┐
                         │    FastAPI    │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ React +       │
                         │ Tailwind      │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   Dashboard   │
                         └───────────────┘

                         n8n
                          │
              Scheduling / Automation
```

---

# 🧩 Why RAG?

Imagine a prospect has a conversation containing ten emails.

The important information may be spread across the entire thread:

```text
Email 1 → Product interest
Email 2 → Pricing question
Email 3 → Technical question
Email 4 → Salesperson responds
Email 5 → Prospect asks for demo
Email 6 → Demo scheduled
Email 7 → Pricing requested again
Email 8 → Salesperson promises response
Email 9 → Prospect follows up
```

Looking at only Email 9 isn't enough.

Sakha retrieves the relevant context from the conversation before generating its recommendation.

This allows the AI to reason over the information that actually matters.

---

# 📈 Designed for 1000+ Emails

Sakha is designed with scale in mind.

Instead of:

```text
1000 Emails
     ↓
1000 LLM Calls
```

the system aims for:

```text
1000+ Emails
      ↓
Group Into Threads
      ↓
Index Locally
      ↓
Retrieve Relevant Context
      ↓
Analyze Meaningful Prospects
```

Local embeddings and ChromaDB reduce unnecessary external API usage.

---

# 🛠️ Tech Stack

| Layer             | Technology            |
| ----------------- | --------------------- |
| Frontend          | React                 |
| Styling           | Tailwind CSS          |
| Frontend Language | JavaScript            |
| Backend           | Python                |
| API               | FastAPI               |
| Email             | Gmail API             |
| Authentication    | Google OAuth 2.0      |
| Embeddings        | Sentence Transformers |
| Embedding Model   | all-MiniLM-L6-v2      |
| Vector Database   | ChromaDB              |
| LLM               | Groq / Gemini         |
| Automation        | n8n                   |
| Version Control   | Git + GitHub          |

---

# 📁 Project Structure

```text
sakha/
│
├── backend/
│   │
│   ├── ingestion/
│   │   ├── gmail_pull.py
│   │   ├── chunker.py
│   │   └── run_pipeline.py
│   │
│   ├── rag/
│   │   ├── embed.py
│   │   ├── vector_store.py
│   │   └── retriever.py
│   │
│   ├── agent/
│   │   └── analysis_chain.py
│   │
│   ├── api/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── ...
│
├── n8n/
│   └── workflow.json
│
├── docs/
│   ├── PWD.md
│   ├── Architecture.md
│   ├── TECH-STACK.md
│   └── DESIGN.md
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Python 3.10+
* Node.js
* npm
* A Google account
* Gmail API credentials

---

## 1. Clone the Repository
>>>>>>> parent of 5f907c4 (updated README file)

```bash
git clone <repository-url>

cd sakha
```

---

## 2. Create a Python Environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

<<<<<<< HEAD
3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the Backend API:**
   ```bash
   uvicorn backend.api.main:app --reload --port 8000
   ```
   > 💡 API documentation is available at `http://127.0.0.1:8000/docs`.
=======
### macOS / Linux

```bash
python3 -m venv venv

source venv/bin/activate
```
>>>>>>> parent of 5f907c4 (updated README file)

---

## 3. Install Backend Dependencies

```bash
<<<<<<< HEAD
cd frontend
npm install
npm run dev
```
> 🌐 Open `http://localhost:5173` to explore the dashboard.
=======
pip install -r backend/requirements.txt
```
>>>>>>> parent of 5f907c4 (updated README file)

---

## 4. Configure Gmail API

Create a project in Google Cloud Console and enable the Gmail API.

Create OAuth credentials and place the credentials file in the location expected by the backend.

<<<<<<< HEAD
### Option B: Google Cloud OAuth 2.0
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project, enable the **Gmail API**, and configure the **OAuth consent screen** (Testing mode).
3. Create **OAuth Client ID** credentials (Desktop Application) and download `credentials.json`.
4. Place `credentials.json` in the root folder of the project.
5. Ingesting will authenticate via your browser.
=======
For hackathon development, the OAuth application can remain in **Testing** mode.

Add the Gmail accounts being used for the demonstration as test users.
>>>>>>> parent of 5f907c4 (updated README file)

---

## 5. Configure Environment Variables

<<<<<<< HEAD
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
=======
Create a `.env` file using:

```text
.env.example
```

Add the required API credentials.

---

## 6. Run the Ingestion Pipeline

```bash
python backend/ingestion/run_pipeline.py
```

This performs:

```text
Gmail
 ↓
Threads
 ↓
Cleaning
 ↓
Chunking
 ↓
Local Embeddings
 ↓
ChromaDB
```

---

## 7. Start the Backend

```bash
uvicorn backend.api.main:app --reload
```

---

## 8. Start the Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔌 API
>>>>>>> parent of 5f907c4 (updated README file)

| Method | Endpoint      | Description                         |
| ------ | ------------- | ----------------------------------- |
| GET    | `/leads`      | Get prioritized prospects           |
| GET    | `/lead/{id}`  | Get detailed prospect information   |
| POST   | `/draft/{id}` | Create Gmail draft                  |
| POST   | `/chat`       | Query sales conversations using RAG |

---

# 🎬 Hackathon Demo

Sakha was designed for a **24-hour hackathon with a team of two**.

For the live demonstration, we prioritize reliability over processing the entire inbox in real time.

The demo focuses on a small set of known leads while the larger 1000+ email index can be processed beforehand or in the background.

### Demo Flow

```text
Connect Gmail
     ↓
Open Sakha Dashboard
     ↓
View Prioritized Leads
     ↓
Select High-Priority Prospect
     ↓
View Conversation
     ↓
See Why Sakha Flagged Them
     ↓
View Recommended Action
     ↓
Generate Follow-Up
     ↓
Create Gmail Draft
     ↓
Human Reviews
```

---

# 🔐 Privacy & Safety

Sakha is designed around a human-in-the-loop workflow.

The AI can analyze conversations and generate recommendations, but it does not automatically send messages.

The salesperson always gets the final decision.

```text
AI
 ↓
Recommendation
 ↓
Draft
 ↓
Human Review
 ↓
Human Decision
```

---

# ⚠️ Current Limitations

Sakha is currently a hackathon prototype.

Some limitations include:

* Gmail OAuth configuration
* Free-tier LLM limits
* Imperfect email parsing
* Imperfect prospect identification
* AI classification errors
* Local hardware limitations
* Limited support for calls and meetings

---

# 🔮 Future Roadmap

Sakha can eventually expand beyond email.

### Communication

* Gmail
* Calendar
* Meeting transcripts
* Call transcripts
* CRM conversations

### Intelligence

* Better sales-specific ranking
* Lead scoring
* Buying-intent detection
* Follow-up success prediction
* Feedback-based recommendations

### Automation

* Smarter incremental ingestion
* Automated reminders
* Sales notifications
* CRM updates

### Advanced AI

* Agentic workflows
* Long-term sales memory
* Reinforcement learning for ranking and prioritization

---

# 👥 Team Sakha

**Built by Team Sakha during a 24-hour hackathon.**

The project was developed using a combination of human engineering and AI-assisted development.

AI coding tools such as **Codex and Antigravity** were used to accelerate development, debugging, and implementation.

The team remained responsible for the product idea, architecture, engineering decisions, integration, testing, and final implementation.

---

# ❤️ Why "Sakha"?

*Sakha* represents a companion or trusted ally.

That's exactly what we want the agent to be.

Not another chatbot.

Not another notification system.

A **sales companion** that stays with the salesperson, keeps track of conversations, and makes sure important opportunities don't get forgotten.

> **You focus on selling. Sakha remembers the follow-up.**

---

## ⭐ If You Like the Project

If Sakha helped you think differently about AI-powered sales workflows, consider giving the repository a ⭐.

---
