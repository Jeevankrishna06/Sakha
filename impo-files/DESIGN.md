Yes. Since we’ve now established **Sakha** as both the team and agent name, I’d redo the other four so they match the quality and terminology of the new GitHub README.

Below are the four updated files.

---

## `PWD.md`

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

---

# `Architecture.md`

# Architecture — Sakha

## 1. Architecture Overview

Sakha is built as a pipeline that takes raw Gmail conversations and transforms them into actionable sales recommendations.

The architecture consists of:

1. Gmail Integration
2. Ingestion Pipeline
3. Data Processing
4. Local Embedding Layer
5. Vector Database
6. RAG Retrieval
7. AI Analysis Agent
8. FastAPI Backend
9. React Frontend
10. Gmail Draft System
11. n8n Automation

---

# 2. High-Level Architecture

```text
                         ┌──────────────────┐
                         │    Gmail API     │
                         │    OAuth 2.0     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Gmail Ingestion  │
                         │      Python      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Clean + Chunk    │
                         │ Email Content    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Local Embeddings │
                         │ all-MiniLM-L6-v2 │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    ChromaDB      │
                         │  Vector Storage  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  RAG Retrieval   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Sakha Agent    │
                         │  Groq / Gemini   │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                Urgency      Next Action      Draft
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     FastAPI      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ React Dashboard  │
                         │  + Tailwind CSS  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Gmail Draft   │
                         └──────────────────┘
```

---

# 3. Gmail Layer

Gmail is the primary source of sales conversation data.

Sakha uses the Gmail API to:

* Authenticate the user
* Retrieve threads
* Retrieve messages
* Read message metadata
* Read email content
* Create drafts

OAuth 2.0 is used for authentication.

---

# 4. Ingestion Layer

The ingestion pipeline retrieves Gmail threads.

The system should process conversations as threads wherever possible.

For example:

```text
Thread: Rahul — Pricing Discussion

Message 1
Rahul asks about pricing.

Message 2
Salesperson responds.

Message 3
Rahul asks about discount.

Message 4
Salesperson promises to respond.

Message 5
Rahul asks for an update.
```

The complete thread provides significantly more useful context than Message 5 alone.

---

# 5. Processing Layer

Raw emails are processed before indexing.

The pipeline performs:

```text
Raw Email
    ↓
Extract Text
    ↓
Remove Unnecessary Content
    ↓
Normalize Text
    ↓
Chunk
    ↓
Attach Metadata
```

Metadata should include:

* Thread ID
* Message ID
* Sender
* Recipient
* Subject
* Date

This allows retrieved chunks to be traced back to their original conversation.

---

# 6. Embedding Layer

Sakha uses:

```text
Sentence Transformers
all-MiniLM-L6-v2
```

The model runs locally.

```text
Email Chunk
     ↓
MiniLM
     ↓
Vector Embedding
```

### Why local?

Using local embeddings:

* Reduces cost
* Avoids embedding API rate limits
* Reduces dependency on external services
* Makes 1000+ email indexing more practical

---

# 7. Vector Database

ChromaDB stores:

* Email chunks
* Embeddings
* Metadata

Example:

```text
Embedding
   +
Email Text
   +
Thread ID
   +
Message ID
   +
Date
   +
Sender
```

This allows Sakha to perform semantic retrieval.

---

# 8. RAG Layer

RAG stands for Retrieval-Augmented Generation.

The basic process is:

```text
Question / Analysis Task
          ↓
Generate Query Embedding
          ↓
Search ChromaDB
          ↓
Retrieve Relevant Context
          ↓
Send Context to LLM
          ↓
Generate Recommendation
```

Sakha therefore does not need to provide the entire inbox to the LLM.

---

# 9. AI Agent

The Sakha agent combines retrieved conversation context with structured sales signals.

Possible inputs:

* Conversation history
* Last message
* Time since last contact
* Last sender
* Buying signals
* Pricing requests
* Demo requests
* Unanswered questions
* Follow-up promises

The agent produces:

```text
Urgency
Reason
Next Action
Draft Message
```

---

# 10. Structured Output

The LLM should return structured JSON.

Example:

```json
{
  "urgency": 9,
  "reason": "Prospect requested pricing and is waiting for a response.",
  "next_action": "Follow up today with pricing information.",
  "draft_message": "Hi Rahul, following up on our pricing discussion..."
}
```

A parser and retry mechanism should be used if the LLM returns invalid JSON.

This prevents malformed responses from breaking the backend.

---

# 11. Deterministic + AI Approach

Sakha should not rely entirely on the LLM.

Some information can be calculated directly.

For example:

```text
Days since last contact
Last sender
Response delay
Follow-up promise
```

Then:

```text
Deterministic Signals
        +
RAG Context
        ↓
    Sakha Agent
        ↓
Recommendation
```

This improves reliability and gives the AI better information.

---

# 12. FastAPI Layer

FastAPI acts as the communication layer between the AI backend and frontend.

Planned endpoints:

```text
GET  /leads
GET  /lead/{id}
POST /draft/{id}
POST /chat
```

### `/leads`

Returns prioritized prospects.

### `/lead/{id}`

Returns information about a specific prospect.

### `/draft/{id}`

Creates a Gmail draft.

### `/chat`

Allows users to query sales conversations using RAG.

---

# 13. Frontend Layer

React communicates with FastAPI.

The frontend displays:

* Lead priority
* Prospect information
* Conversation
* AI reasoning
* Recommended action
* Generated draft

Tailwind CSS handles styling.

---

# 14. Gmail Draft Flow

The final flow is:

```text
Sakha Agent
     ↓
Generate Message
     ↓
User Reviews
     ↓
Create Gmail Draft
     ↓
User Opens Gmail
     ↓
User Makes Final Decision
     ↓
Send
```

Sakha never automatically sends the generated message.

---

# 15. n8n Layer

n8n is used for automation surrounding the core system.

Example:

```text
Scheduled Trigger
       ↓
Start Ingestion
       ↓
Process New Emails
       ↓
Update Sakha
       ↓
Optional Notification
```

n8n should not replace the core Python/RAG architecture.

---

# 16. Scale Considerations

For 1000+ emails:

### Avoid

```text
1000 Emails
   ↓
1000 LLM Calls
```

### Prefer

```text
1000+ Emails
      ↓
Thread Processing
      ↓
Local Indexing
      ↓
Semantic Retrieval
      ↓
Meaningful Prospect Analysis
```

The system should also support Gmail pagination and eventually incremental ingestion.

---

# 17. Failure Handling

The system should handle:

### Gmail

* Authentication errors
* API failures
* Missing messages
* Pagination issues

### Processing

* Empty email bodies
* Unsupported formats
* Malformed content

### RAG

* Embedding errors
* ChromaDB errors
* Missing retrieval results

### LLM

* API failure
* Rate limits
* Invalid JSON
* Empty responses

### Gmail Draft

* Draft creation failure
* Invalid recipient information

The application should fail gracefully rather than crash the entire workflow.

---

# 18. Security Considerations

Sensitive Gmail credentials should never be committed to GitHub.

The repository should include:

```text
.env.example
```

but never:

```text
.env
credentials.json
token.json
```

These files should be added to `.gitignore`.

---

# 19. Architecture Principle

The architecture should remain simple enough that both team members can understand and debug it during the hackathon.

The goal is not maximum technical complexity.

The goal is:

**Reliable end-to-end functionality.**

---

# `TECH-STACK.md`

# Tech Stack — Sakha

## 1. Technology Overview

Sakha uses a lightweight AI application stack designed specifically for a 24-hour hackathon.

The technology choices focus on:

* Free usage
* Fast development
* Simple architecture
* Local processing where possible
* Easy debugging
* Ability to handle 1000+ emails

---

# 2. Frontend

## React

React is used to build the Sakha dashboard.

Responsibilities:

* Display prioritized prospects
* Show urgency scores
* Display conversation details
* Show AI recommendations
* Display generated follow-up messages
* Trigger Gmail draft creation

---

## JavaScript

JavaScript is used for frontend application logic.

It handles:

* API calls
* User interactions
* UI state
* Dashboard functionality

---

## Tailwind CSS

Tailwind CSS is used for styling.

It allows rapid development of:

* Cards
* Tables
* Buttons
* Badges
* Layouts
* Responsive interfaces

The design should remain professional rather than overly decorative.

---

# 3. Backend

## Python

Python is used for the AI and data-processing side of Sakha.

Responsibilities:

* Gmail integration
* Email processing
* Chunking
* Embedding generation
* RAG
* LLM integration
* API development

Python is also well supported by the AI ecosystem.

---

## FastAPI

FastAPI is the backend API framework.

It connects the frontend with the AI system.

Main endpoints:

```text
GET  /leads
GET  /lead/{id}
POST /draft/{id}
POST /chat
```

---

# 4. Gmail Integration

## Gmail API

The Gmail API provides access to:

* Email threads
* Email messages
* Sender information
* Recipient information
* Subjects
* Dates
* Email content
* Gmail drafts

---

## Google OAuth 2.0

OAuth 2.0 is used to authenticate the Gmail account.

For hackathon development, the OAuth application can remain in Testing mode.

Only configured test users should access it.

---

# 5. RAG Stack

## Sentence Transformers

Sentence Transformers generates the email embeddings.

The selected model is:

```text
all-MiniLM-L6-v2
```

---

## Why all-MiniLM-L6-v2?

It is:

* Lightweight
* Fast
* Free
* Available locally
* Suitable for semantic search
* Practical for a hackathon

---

## ChromaDB

ChromaDB is used as the vector database.

It stores:

```text
Email Text
Embeddings
Metadata
```

Metadata includes information such as:

* Thread ID
* Message ID
* Sender
* Recipient
* Subject
* Date

---

# 6. LLM

Sakha can use a free-tier LLM provider.

The current candidates are:

## Groq

Useful when fast inference is important.

## Gemini

Can be used as an alternative depending on available free-tier limits and reliability.

The LLM is primarily responsible for:

* Understanding retrieved context
* Classifying urgency
* Recommending actions
* Generating follow-up messages

The LLM should not be unnecessarily called for every email.

---

# 7. Automation

## n8n

n8n is used for workflow automation.

Possible responsibilities:

* Scheduled ingestion
* Triggering processing
* Notifications
* Connecting Sakha with external workflows

Example:

```text
Schedule
   ↓
Trigger Sakha
   ↓
Process New Emails
   ↓
Update Leads
   ↓
Notification
```

---

# 8. Version Control

## Git

Git is used for local version control.

---

## GitHub

GitHub is used for:

* Source code
* Team collaboration
* Documentation
* Issue tracking
* Hackathon submission

---

# 9. AI Development Tools

## Codex

Can be used to:

* Generate boilerplate
* Debug code
* Explain unfamiliar code
* Refactor components
* Help connect backend and frontend

---

## Antigravity

Can be used to:

* Build features
* Debug implementation
* Connect components
* Speed up development

AI coding tools accelerate development but do not replace understanding of the final system.

---

# 10. Why We Avoid a Paid Embedding API

A key design decision is generating embeddings locally.

Instead of:

```text
Email
 ↓
External Embedding API
 ↓
Vector
```

Sakha uses:

```text
Email
 ↓
Local MiniLM
 ↓
Vector
```

This reduces:

* Cost
* API dependency
* Rate-limit problems

This is especially useful for 1000+ emails.

---

# 11. Why We Use ChromaDB

A production system could use a managed vector database.

For a 24-hour hackathon, that would introduce unnecessary setup and dependencies.

ChromaDB provides:

* Local storage
* Simple setup
* Semantic search
* Metadata support
* No additional server required for the prototype

---

# 12. Why FastAPI?

FastAPI is lightweight and easy to connect to React.

It provides a clean interface:

```text
React
  ↓
FastAPI
  ↓
Sakha Agent
  ↓
RAG
  ↓
Gmail
```

---

# 13. Technology Summary

```text
Frontend
├── React
├── JavaScript
└── Tailwind CSS

Backend
├── Python
└── FastAPI

RAG
├── Sentence Transformers
├── all-MiniLM-L6-v2
└── ChromaDB

AI
├── Groq
└── Gemini

Integration
├── Gmail API
└── Google OAuth 2.0

Automation
└── n8n

Development
├── Git
├── GitHub
├── Codex
└── Antigravity
```

---

# 14. Technology Principle

The technology stack is intentionally simple.

We do not want the hackathon to become a battle between infrastructure and the actual product.

The priority is:

```text
Simple
   ↓
Reliable
   ↓
Understandable
   ↓
Demo-ready
```

rather than unnecessary technical complexity.

---

# `DESIGN.md`

# Design — Sakha

## 1. Product Design

Sakha is designed as an **AI sales companion**, not as a generic chatbot.

The primary purpose of the interface is to help a salesperson quickly understand:

> **Who should I follow up with right now?**

The interface should then answer:

> **Why?**

and:

> **What should I do?**

---

# 2. Design Principles

## Priority First

The most important prospects should appear at the top.

The salesperson should not have to search through the entire inbox.

---

## Action Oriented

Every important lead should have a clear next action.

For example:

```text
Follow up today
Send pricing
Schedule demo
Answer technical question
Wait for response
```

---

## Explainable

Sakha should not simply display:

```text
Urgency: 9/10
```

It should explain:

```text
Urgency: 9/10

The prospect requested pricing three days ago
and is waiting for a response.
```

---

## Human in the Loop

The AI should assist the salesperson, not operate without supervision.

The UI should make this clear.

---

## Professional

Sakha should look like a real sales productivity tool.

Avoid excessive:

* Animations
* Gradients
* AI-themed visual effects
* Decorative elements
* Complicated navigation

The information should be the focus.

---

# 3. Main Dashboard

The dashboard is the main screen.

Suggested structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ SAKHA                                   Last Sync: 2 min ago │
│ AI Sales Follow-Up Agent                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Total Leads       Urgent       Due Today       Waiting      │
│     127              8            15             104        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Search prospects...                     Filter: All ▼       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Rahul Sharma                                  9/10          │
│ Acme Technologies                                           │
│                                                             │
│ Last contact: 3 days ago                                    │
│                                                             │
│ Reason:                                                     │
│ Prospect requested pricing and is waiting for a response.   │
│                                                             │
│ Next Action:                                                │
│ Follow up today with pricing information.                   │
│                                                             │
│ [View Lead]                     [Create Draft]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 4. Lead Card

Each lead should show the information needed to make a quick decision.

### Required information

* Prospect name
* Company
* Urgency
* Last contact
* Reason
* Recommended action

### Actions

* View conversation
* Create draft

Example:

```text
┌───────────────────────────────────────┐
│ Rahul Sharma                   9/10   │
│ Acme Technologies                     │
│                                       │
│ Last contact: 3 days ago              │
│                                       │
│ HIGH PRIORITY                         │
│                                       │
│ Pricing requested and response        │
│ is overdue.                           │
│                                       │
│ Next: Follow up today.                │
│                                       │
│ [View]             [Create Draft]     │
└───────────────────────────────────────┘
```

---

# 5. Urgency System

Sakha uses a score from 1 to 10.

```text
1–3     Low
4–6     Medium
7–8     High
9–10    Critical
```

The score should always be accompanied by a reason.

The UI should not rely only on color to communicate urgency.

---

# 6. Lead Detail View

Selecting a lead should open a detailed view.

```text
┌───────────────────────────────────────────────────────────┐
│ Rahul Sharma                                  Urgency 9/10 │
├─────────────────────────────┬─────────────────────────────┤
│ Conversation                │ Sakha Recommendation        │
│                             │                             │
│ Rahul:                      │ Why is this urgent?         │
│ "Can you send pricing?"     │                             │
│                             │ Prospect requested pricing  │
│ Salesperson:                │ and is waiting for a        │
│ "I'll send it tomorrow."    │ response.                   │
│                             │                             │
│ Rahul:                      │ Next Action:                │
│ "Any update?"               │ Follow up today.             │
│                             │                             │
│                             │ [Generate Draft]            │
└─────────────────────────────┴─────────────────────────────┘
```

---

# 7. Conversation View

The conversation should resemble an email thread.

Each message should clearly show:

* Sender
* Date
* Message
* Direction

Example:

```text
Rahul Sharma
Aug 26

Can you send me the pricing information?


Sales Team
Aug 26

Sure, I'll send it tomorrow.


Rahul Sharma
Aug 28

Any update on the pricing?
```

This allows the salesperson to verify the AI's reasoning.

---

# 8. AI Recommendation Panel

The recommendation panel should contain three main pieces of information.

### Why?

Why Sakha thinks this lead needs attention.

### Next Action

What the salesperson should do.

### Draft

The generated message.

Example:

```text
WHY?

The prospect requested pricing and followed
up after the promised response date.

NEXT ACTION

Follow up today with pricing information.

DRAFT

Hi Rahul,

Following up on our pricing discussion...
```

---

# 9. Draft Review

The draft should be editable.

```text
┌─────────────────────────────────────────────┐
│ Follow-Up Draft                             │
├─────────────────────────────────────────────┤
│ To: Rahul Sharma                            │
│                                             │
│ Subject: Pricing and Next Steps             │
│                                             │
│ Hi Rahul,                                   │
│                                             │
│ Following up on our pricing discussion.     │
│ I apologize for the delay...                │
│                                             │
│ Best,                                       │
│ Jeevan                                      │
├─────────────────────────────────────────────┤
│                                             │
│ [Edit]                [Create Gmail Draft]  │
└─────────────────────────────────────────────┘
```

The button should say **Create Gmail Draft**, not Send.

---

# 10. Human-in-the-Loop UX

The UI should make the workflow obvious:

```text
AI Analysis
     ↓
Recommendation
     ↓
Draft
     ↓
Human Review
     ↓
Human Decision
```

Sakha should never make the user feel that an email was sent automatically.

---

# 11. RAG Chat

If included in the MVP, the chat should be a secondary feature.

It should allow questions such as:

```text
Which prospects are waiting for pricing?

Who hasn't received a response in the last three days?

Which leads asked for a demo?

Show me prospects with high buying intent.
```

The answers should come from retrieved sales conversations.

---

# 12. Example RAG Chat

```text
┌─────────────────────────────────────────────┐
│ Ask Sakha about your sales conversations    │
├─────────────────────────────────────────────┤
│                                             │
│ Which prospects are waiting for pricing?    │
│                                             │
│ Sakha:                                      │
│                                             │
│ Rahul Sharma and Priya Mehta appear to      │
│ be waiting for pricing information.         │
│                                             │
│ Rahul last contacted the sales team         │
│ 3 days ago.                                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 13. Loading States

The application should clearly communicate when AI processing is happening.

Examples:

```text
Connecting to Gmail...
```

```text
Indexing conversations...
```

```text
Analyzing sales conversation...
```

```text
Generating personalized follow-up...
```

---

# 14. Empty States

If there are no urgent leads:

```text
No follow-ups required right now.

Sakha couldn't find any prospects
that currently require attention.
```

---

# 15. Error States

### Gmail Error

```text
Unable to connect to Gmail.

Please reconnect your account and try again.
```

### AI Error

```text
Sakha couldn't generate a recommendation.

Please try again.
```

### Draft Error

```text
We couldn't create the Gmail draft.

Please try again.
```

---

# 16. Responsive Design

The primary target is desktop because sales teams are likely to use Sakha alongside their email and CRM tools.

The interface should still work on:

* Laptop
* Tablet
* Smaller screens

---

# 17. Visual Direction

Sakha should feel:

* Professional
* Reliable
* Clean
* Intelligent
* Practical
* Easy to understand

The visual language should communicate **productivity and trust**, not science fiction.

---

# 18. Navigation

Keep navigation minimal.

Suggested sections:

```text
Sakha
│
├── Dashboard
├── Follow-Ups
├── Conversations
└── Settings
```

If time is limited, the MVP can use only:

```text
Dashboard
```

with lead details opening from the dashboard.

---

# 19. Primary User Journey

```text
Open Sakha
     ↓
See prioritized leads
     ↓
Choose high-priority lead
     ↓
Review conversation
     ↓
Understand why Sakha flagged it
     ↓
See next best action
     ↓
Generate follow-up
     ↓
Review / edit
     ↓
Create Gmail Draft
     ↓
Human decides whether to send
```

---

# 20. Design Philosophy

Sakha should not try to impress users with complicated AI interfaces.

The product should make a salesperson's life easier.

The ideal experience can be summarized as:

```text
WHO?
Rahul Sharma

WHY?
He requested pricing and is waiting
for a response.

WHAT?
Follow up today with pricing.

DRAFT?
Already prepared.
```

### Sakha's interface should turn a messy inbox into a clear action list.

> **You focus on selling. Sakha remembers the follow-up.**
