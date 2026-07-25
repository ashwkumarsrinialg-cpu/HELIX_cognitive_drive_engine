var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, z, Injectable } from '@nitrostack/core';
import { LLMService } from '../../services/llm.service.js';
import { RAGService } from '../../services/rag.service.js';
let HelixTools = class HelixTools {
    llmService;
    ragService;
    constructor(llmService, ragService) {
        this.llmService = llmService;
        this.ragService = ragService;
    }
    async chat(input, ctx) {
        const res = await this.ragService.askQuestion(input.message, input.department || 'Engineering');
        return {
            response: res.answer,
            confidence: res.confidence_score,
            sources: res.sources
        };
    }
    async askQuestion(input, ctx) {
        const result = await this.ragService.askQuestion(input.question, input.department || 'Engineering');
        return result;
    }
    async analyzeDrift(input, ctx) {
        const result = await this.ragService.analyzeDrift(input.department, input.signals);
        return result;
    }
};
__decorate([
    Tool({
        name: 'chat',
        description: 'Conversational interface with RAG context for HELIX Cognitive Platform',
        inputSchema: z.object({
            message: z.string().describe('User message or question'),
            department: z.string().optional().describe('Target enterprise department')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HelixTools.prototype, "chat", null);
__decorate([
    Tool({
        name: 'ask_question',
        description: 'Answer enterprise questions grounded in 100% accuracy Hybrid RAG knowledge',
        inputSchema: z.object({
            question: z.string().describe('Enterprise query to answer'),
            department: z.string().optional().describe('Department context')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HelixTools.prototype, "askQuestion", null);
__decorate([
    Tool({
        name: 'analyze_drift',
        description: 'Execute 4-Vector Cognitive Drift Diagnostic for enterprise departments',
        inputSchema: z.object({
            department: z.string().describe('Department to analyze'),
            signals: z.array(z.string()).describe('Operational signal logs')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HelixTools.prototype, "analyzeDrift", null);
HelixTools = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [LLMService,
        RAGService])
], HelixTools);
export { HelixTools };
//# sourceMappingURL=helix.tools.js.map