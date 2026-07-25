import { ConfigService } from '@nitrostack/core';
/**
 * EmbeddingsService
 * Handles text embedding generation using OpenAI's embedding models.
 */
export declare class EmbeddingsService {
    private configService;
    private openai;
    private model;
    constructor(configService: ConfigService);
    /**
     * Generate embeddings for a single text
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generate embeddings for multiple texts (batch)
     */
    embedBatch(texts: string[]): Promise<number[][]>;
    /**
     * Calculate cosine similarity between two embeddings
     */
    cosineSimilarity(a: number[], b: number[]): number;
}
//# sourceMappingURL=embeddings.service.d.ts.map