# Enterprise-SOP-Agent
This is a internship project.
# SOP Question Answering System (RAG)

## Overview
This project implements a Retrieval-Augmented Generation (RAG) system
that allows users to upload SOP PDFs and ask questions.
The system retrieves relevant document chunks using vector search
and generates grounded answers with source citations.

## Tech Stack
- Node.js + Express
- MongoDB Atlas Vector Search
- Local Embeddings (MiniLM via transformers.js)
- Streaming Chat (LLM)
- PDF parsing

## Architecture
1. PDF is uploaded and split into overlapping chunks
2. Each chunk is converted into embeddings
3. MongoDB Atlas performs vector similarity search
4. Relevant chunks are sent to the LLM
5. The response is streamed with source references

## Key Features
- Offline/local embeddings (no API cost)
- Vector-based semantic search
- Hallucination control
- Source citation in answers
- Streaming responses

## How to Run
1. Install dependencies
2. Start server: `node index.js`
3. Upload PDF
4. Generate embeddings
5. Ask questions via `/chat`

