# HELIX: Enterprise Cognitive Genome Platform ("Brain")

HELIX is an enterprise cognitive intelligence system designed to model organizational context, evaluate strategic alignment across 4 cognitive dimensions, detect and prevent organizational cognitive drift, and answer complex enterprise questions using hybrid RAG and Qdrant.

---

## Folder Structure

```
helix_brain/
├── ai/
│   ├── __init__.py          # Package initializer
│   ├── llm.py              # Multi-model LLM router (GPT-5.5, Qwen, OpenAI)
│   ├── rag.py              # Hybrid RAG pipeline (Dense Vector + BM25 + RRF)
│   ├── embeddings.py       # 1536-dim vector embeddings & similarity math
│   ├── qdrant_client.py    # Production Qdrant vector database client
│   ├── prompt.py           # Cognitive drift & recommendation prompt templates
│   ├── genome.py           # 4-Vector Cognitive Genome profile
│   ├── drift_engine.py     # Cognitive drift diagnostic engine
│   └── recommendations.py  # Anti-drift Realignment Action Plan generator
├── main.py                 # FastAPI / REST API Server
├── requirements.txt        # Package dependencies
└── README.md               # Production setup documentation
```

---

## Database & Environment Configuration

Set your environment variables before running the server:

```bash
# Vector Database (Qdrant)
export QDRANT_URL="http://localhost:6333"      # Or your Qdrant Cloud URL
export QDRANT_API_KEY="your-qdrant-api-key"     # Optional if local

# LLM Providers (GPT-5.5 / Qwen / OpenAI)
export OPENAI_API_KEY="your-openai-api-key"
export QWEN_API_KEY="your-qwen-api-key"
export HELIX_LLM_MODEL="gpt-5.5"               # Or qwen-2.5-72b / gpt-4o
export LLM_BASE_URL="http://localhost:11434"    # Optional local Ollama endpoint
```

---

## Run Server

```bash
python helix_brain/main.py
```

### REST API Endpoints Available:
- **`POST /chat`**: Enterprise cognitive chat.
- **`POST /recommendation`**: Generates Anti-Drift Realignment Action Plans (RAPs).
- **`POST /ask`**: Answers enterprise questions using RAG and vector database search.
- **`POST /drift/analyze`**: 4-vector Cognitive Drift diagnostic audit.
- **`POST /index`**: Ingests enterprise documents into your vector database.
- **`GET  /genome/{department}`**: Retrieves department cognitive genome profile.
- **`GET  /health`**: Health status and vector count metrics.
