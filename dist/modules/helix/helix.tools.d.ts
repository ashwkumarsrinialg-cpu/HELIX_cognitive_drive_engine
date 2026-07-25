import { ExecutionContext } from '@nitrostack/core';
import { LLMService } from '../../services/llm.service.js';
import { RAGService } from '../../services/rag.service.js';
export declare class HelixTools {
    private llmService;
    private ragService;
    constructor(llmService: LLMService, ragService: RAGService);
    chat(input: {
        message: string;
        department?: string;
    }, ctx: ExecutionContext): Promise<{
        response: any;
        confidence: any;
        sources: any;
    }>;
    askQuestion(input: {
        question: string;
        department?: string;
    }, ctx: ExecutionContext): Promise<any>;
    analyzeDrift(input: {
        department: string;
        signals: string[];
    }, ctx: ExecutionContext): Promise<any>;
}
//# sourceMappingURL=helix.tools.d.ts.map