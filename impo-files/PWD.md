# PWD — Sakha

## Project Name

**Sakha — AI Sales Follow-Up Agent**

## Team

**Team Sakha**

---

# 1. Problem Statement

Sales representatives communicate with many prospects every day through emails, calls, and meetings.

As the number of conversations increases, important follow-ups can easily be missed.

A prospect may:

* Ask for pricing and never receive it.
* Request a product demo.
* Ask an important question.
* Wait for a response that was promised.
* Show strong buying interest and then go unnoticed.

These situations can cause potential customers to lose interest.

### The core problem

**Sales teams have the information, but they don't always know which information requires action right now.**

---

# 2. Our Solution

Sakha is an AI sales follow-up agent that analyzes Gmail conversations and identifies prospects who may require attention.

Sakha answers three questions:

### WHO?

Which prospect needs attention?

### WHY?

Why does this prospect need attention?

### WHAT?

What should the salesperson do next?

Sakha then generates a personalized follow-up message and creates it as a Gmail draft.

The salesperson reviews the draft before sending it.

---

# 3. Product Goal

The goal of Sakha is not to replace the salesperson.

The goal is to reduce the manual work involved in:

* Searching through conversations
* Remembering follow-ups
* Identifying important prospects
* Understanding conversation history
* Writing repetitive follow-up messages

Sakha acts as a **sales companion** that remembers the conversations so the salesperson can focus on selling.

---

# 4. Core Workflow

```text
Gmail
   ↓
Retrieve Email Threads
   ↓
Clean Email Content
   ↓
Chunk Conversations
   ↓
Generate Local Embeddings
   ↓
Store in ChromaDB
   ↓
Retrieve Relevant Context
   ↓
AI Analysis
   ↓
Prioritize Prospect
   ↓
Recommend Next Action
   ↓
Generate Follow-Up
   ↓
Create Gmail Draft
   ↓
Human Review
```

---

# 5. Hackathon Constraints

The project is being developed during a:

* 24-hour hackathon
* Team of 2
* Free-tools-only environment

Both team members have limited Python experience.

Available development tools include:

* Python
* React
* JavaScript
* CSS
* Tailwind CSS
* n8n
* Codex
* Antigravity

The system should demonstrate the ability to work with **1000+ real Gmail emails**.

---

# 6. MVP Scope

The Minimum Viable Product should include:

## Gmail

* Gmail OAuth
* Gmail thread retrieval
* Email metadata extraction
* Gmail draft creation

## RAG

* Email cleaning
* Chunking
* Local embeddings
* ChromaDB
* Semantic retrieval

## AI

* Conversation analysis
* Urgency scoring
* Reason for urgency
* Next best action
* Personalized follow-up generation
* Structured JSON output

## Frontend

* Prioritized lead dashboard
* Lead details
* Conversation view
* AI recommendation
* Draft generation

---

# 7. Important Product Rule

### Sakha must never automatically send an email.

The system follows:

```text
AI Analysis
     ↓
Generate Draft
     ↓
Human Review
     ↓
Human Decision
     ↓
Send
```

This keeps the salesperson in control.

---

# 8. Priority Levels

Sakha uses a 1–10 urgency score.

```text
1–3   Low
4–6   Medium
7–8   High
9–10  Critical
```

The score should always have a human-readable explanation.

Example:

```text
Urgency: 9/10

Reason:
The prospect requested pricing three days ago
and has not received the promised response.

Next Action:
Follow up today with pricing information.
```

---

# 9. Scale Strategy

The target is 1000+ emails.

We should avoid sending every email to the LLM.

Instead:

```text
1000+ Emails
     ↓
Group Into Threads
     ↓
Clean + Index
     ↓
Retrieve Relevant Context
     ↓
Analyze Important Prospects
```

Local embeddings are used to avoid external embedding API limits.

---

# 10. Demo Strategy

The live demo should use approximately 5–10 known leads.

The purpose of the demo is to show the complete product experience rather than wait for a large inbox to process live.

### Demo:

```text
Connect Gmail
      ↓
Open Sakha
      ↓
Show Prioritized Leads
      ↓
Open High-Priority Lead
      ↓
Show Conversation
      ↓
Show AI Reasoning
      ↓
Show Recommended Action
      ↓
Generate Follow-Up
      ↓
Create Gmail Draft
      ↓
Human Reviews
```

---

# 11. Development Priorities

## P0 — Must Work

* Gmail authentication
* Gmail ingestion
* Email cleaning
* Chunking
* Local embeddings
* ChromaDB
* Retrieval
* LLM analysis
* Structured JSON
* Lead prioritization
* Gmail draft creation
* Basic dashboard

## P1 — If Time Allows

* Incremental ingestion
* Better quoted-reply removal
* Better signature removal
* Prospect/contact grouping
* RAG chat
* n8n notifications

## P2 — Future

* CRM integration
* Calendar integration
* Call transcript analysis
* Meeting transcript analysis
* Advanced lead scoring
* Feedback loops
* Reinforcement learning

---

# 12. Success Criteria

Sakha should successfully demonstrate:

```text
Real Gmail Conversation
        ↓
Identify Follow-Up Need
        ↓
Explain Why
        ↓
Recommend Action
        ↓
Generate Personalized Message
        ↓
Create Gmail Draft
```

If this complete workflow works reliably, the MVP is successful.

---

# 13. Project Philosophy

Sakha is not intended to be another generic chatbot.

It is an action-oriented sales assistant.

The product should make the salesperson's workflow simpler:

> **Who needs attention? Why? And what should I do next?**
