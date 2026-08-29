# Sakha — AI Sales Follow-Up Agent

> **Your AI sales companion that makes sure no lead gets forgotten.**

Sakha is an AI-powered sales follow-up agent that connects with Gmail, understands sales conversations, identifies prospects who need attention, recommends the next best action, and generates personalized follow-up drafts.

Built by **Team Sakha** during a **24-hour hackathon**.

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

A typical sales representative may have hundreds or even thousands of emails.

Important signals can easily get lost:

* A prospect asked for pricing.
* A customer requested a demo.
* Someone is waiting for a promised response.
* A prospect followed up but never received an answer.
* A potentially high-value lead has gone cold.

The problem isn't a lack of information.

**The problem is finding the right information at the right time.**

---

## 💡 The Sakha Approach

Sakha connects to Gmail and uses **Retrieval-Augmented Generation (RAG)** to understand sales conversations.

It doesn't simply ask an LLM to read every email.

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
```

---

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

### macOS / Linux

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## 3. Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

---

## 4. Configure Gmail API

Create a project in Google Cloud Console and enable the Gmail API.

Create OAuth credentials and place the credentials file in the location expected by the backend.

For hackathon development, the OAuth application can remain in **Testing** mode.

Add the Gmail accounts being used for the demonstration as test users.

---

## 5. Configure Environment Variables

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
