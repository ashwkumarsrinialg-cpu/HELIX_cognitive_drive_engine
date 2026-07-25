var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ConfigService } from '@nitrostack/core';
import { OpenAI } from 'openai';
/**
 * EmbeddingsService
 * Handles text embedding generation using OpenAI's embedding models.
 */
let EmbeddingsService = class EmbeddingsService {
    configService;
    openai;
    model = 'text-embedding-3-small';
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }
        this.openai = new OpenAI({ apiKey });
    }
    /**
     * Generate embeddings for a single text
     */
    async embed(text) {
        const response = await this.openai.embeddings.create({
            model: this.model,
            input: text,
        });
        return response.data[0].embedding;
    }
    /**
     * Generate embeddings for multiple texts (batch)
     */
    async embedBatch(texts) {
        const response = await this.openai.embeddings.create({
            model: this.model,
            input: texts,
        });
        return response.data.map(item => item.embedding);
    }
    /**
     * Calculate cosine similarity between two embeddings
     */
    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
};
EmbeddingsService = __decorate([
    Injectable({ deps: [ConfigService] }),
    __metadata("design:paramtypes", [ConfigService])
], EmbeddingsService);
export { EmbeddingsService };
//# sourceMappingURL=embeddings.service.js.map