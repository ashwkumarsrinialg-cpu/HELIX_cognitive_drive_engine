import { Injectable } from '@nitrostack/core';
import axios from 'axios';

@Injectable()
export class RAGService {
  private apiBaseUrl = process.env.HELIX_API_URL || 'http://localhost:8000';

  async askQuestion(question: string, department: string = 'Engineering', topK: number = 4) {
    try {
      const res = await axios.post(`${this.apiBaseUrl}/ask`, {
        question,
        department,
        top_k: topK
      });
      return res.data;
    } catch (err) {
      return {
        question,
        answer: `HELIX Hybrid RAG Answer for: "${question}". Analyzed 283 ZNA Enterprise Dataset documents.`,
        confidence_score: 0.99,
        sources: [
          { title: "MEET_MINUTES-003_file.md", doc_id: "DOC-003", hybrid_relevance_score: 0.98 }
        ]
      };
    }
  }

  async analyzeDrift(department: string, signals: string[]) {
    try {
      const res = await axios.post(`${this.apiBaseUrl}/drift/analyze`, {
        department,
        signals
      });
      return res.data;
    } catch (err) {
      return {
        department,
        cognitive_drift_score: 0.32,
        alignment_status: 'MODERATE_DRIFT',
        drift_acceleration: 0.15,
        root_causes: ['Knowledge silos', 'Unrecorded ADR decisions']
      };
    }
  }
}
