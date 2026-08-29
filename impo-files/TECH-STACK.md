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
