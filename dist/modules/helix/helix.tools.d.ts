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
    injectSignal(input: {
        title: string;
        content: string;
        department: string;
    }, ctx: ExecutionContext): Promise<{
        status: string;
        message: string;
        department: string;
    }>;
    getGenomeProfile(ctx: ExecutionContext): Promise<{
        S_strategic_horizon: number;
        P_process_rigor: number;
        C_conceptual_cohesion: number;
        M_memory_retention: number;
        timestamp: string;
    }>;
    getDriftAnalysisPrompt(args: {
        department: string;
        driftScore: string;
    }, ctx: ExecutionContext): Promise<{
        messages: {
            role: string;
            content: string;
        }[];
    }>;
}
//# sourceMappingURL=helix.tools.d.ts.map