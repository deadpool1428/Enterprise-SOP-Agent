# This is Internship Project
Enterprise SOP Intelligence Platform
(AI-MERN Stack | Retrieval-Augmented Generation)
________________________________________
Executive Summary
This project delivers an enterprise-grade SOP Intelligence Platform that enables employees and stakeholders to query internal Standard Operating Procedure (SOP) documents using natural language.
The system is built on a Retrieval Augmented Generation (RAG) architecture and is intentionally designed to prioritize accuracy, compliance, and safety over verbosity or speculation.
Core Principle:
The system will only answer when information is explicitly grounded in approved SOP documents.
In all other cases, it will safely refuse to respond.
________________________________________
Business Problem Addressed
Organizations frequently face challenges such as:
•	Difficulty locating relevant SOP information quickly
•	Risk of misinformation from informal knowledge sharing
•	Dependence on HR or Compliance teams for routine queries
•	Lack of auditability in AI-driven answers
This platform addresses these challenges by providing:
•	Controlled, document-grounded answers
•	Transparent refusal when information is unavailable
•	Strong safeguards against hallucinated responses
________________________________________
Solution Overview
The platform ingests SOP documents (PDF format), processes them into searchable knowledge units, and enables question-answering through a secure AI pipeline.
All responses are:
•	Derived strictly from SOP content
•	Traceable to retrieved document sections
•	Designed for enterprise compliance use cases
________________________________________
System Architecture
User Query
   ↓
Query Embedding Generation
   ↓
MongoDB Atlas Vector Search
   ↓
Relevant SOP Chunks Retrieved
   ↓
Context Assembly (Bounded)
   ↓
Local LLM Inference
   ↓
Final Answer or Safe Refusal
________________________________________
Key Capabilities
•	SOP-grounded question answering
•	Vector-based semantic search
•	Hallucination-resistant responses
•	Out-of-scope query rejection
•	Local LLM inference for data privacy
•	Explainable and predictable behavior
________________________________________
Technology Stack
Layer	Technology
Backend	Node.js, Express.js
Database	MongoDB Atlas
Vector Search	MongoDB Atlas Vector Index
Embeddings	Local embedding model
Language Model	Ollama (local inference)
Document Parsing	PDF processing
Configuration	Environment-based (.env)
________________________________________
Repository Structure
mongo-test/
│
├── models/
│   └── Chunk.js              # SOP chunk schema
│
├── routes/
│   ├── upload.js             # SOP ingestion & chunking
│   ├── embedding.js          # Embedding generation
│   └── chat.js               # RAG-based QA service
│
├── utils/
│   ├── embedding.js          # Embedding utilities
│   └── generateAnswer.js     # Controlled answer generation
│
├── index.js                  # Application entry point
├── .env                      # Environment configuration
└── README.md
________________________________________
SOP Processing Workflow
1.	SOP documents are uploaded in PDF format
2.	Documents are parsed and segmented into overlapping text chunks
3.	Each chunk is embedded and stored in MongoDB
4.	Queries retrieve only the most relevant SOP sections
5.	Answers are generated strictly from retrieved content
________________________________________
Response Policy & Safety Controls
The platform follows a conservative enterprise response policy:
•	✔ Answers only when confidently grounded
•	✔ Explicit refusal when information is missing or ambiguous
•	✔ No speculative or inferred responses
•	✔ Clear separation between in-scope and out-of-scope queries
Example Behavior
Query Type	System Response
SOP policy question	Answered if explicitly documented
Salary / compensation	Refused if not in SOP
External knowledge (e.g., public companies)	Refused
Ambiguous or exception-heavy policy	Refused
This behavior is intentional and compliant by design.
________________________________________
Running the Application
Dependency Installation
npm install
Environment Configuration
Create a .env file:
MONGO_URL=<MongoDB Atlas connection string>
Local Model Setup
ollama pull phi3
ollama serve
Start Application
npm run devStart
________________________________________
API Testing Example
$response = Invoke-RestMethod `
  -Uri http://localhost:3000/chat `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{ question = "What is the standard notice period for permanent employees?" } | ConvertTo-Json)

$response.answer
________________________________________
Demonstration-Ready Queries
•	What is the standard notice period for permanent employees?
•	What is the settlement timeline for interns?
•	Are interns eligible for experience letters?
•	What is the salary for interns? (Expected refusal)
•	Who is the CEO of Google? (Expected refusal)
________________________________________
Known Constraints (Design Trade-offs)
•	Structured tables are handled conservatively
•	Clause numbers are not explicitly extracted
•	Local inference introduces moderate latency
•	Over-refusal is preferred to hallucination
These constraints are intentional for v1 and align with enterprise risk tolerance.
________________________________________
Roadmap (Future Enhancements)
•	Structured table extraction
•	Clause-level citation support
•	Reranking for improved precision
•	UI-based SOP management dashboard
•	Hybrid rule-based + LLM reasoning
________________________________________
Project Status
Version: v1.0 (Stable)
Readiness: Demo-ready, submission-ready
Design Focus: Accuracy, compliance, safety
________________________________________
Closing Statement
This platform demonstrates a practical, enterprise-aligned approach to AI adoption, emphasizing trust, governance, and explainability over speculative intelligence.
It is suitable for:
•	Internal pilots
•	Compliance-sensitive environments
•	SOP knowledge management use cases

