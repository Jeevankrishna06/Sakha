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
