import { ConfigService } from '@nitrostack/core';
export interface QdrantPoint {
    id: string;
    vector: number[];
    payload: Record<string, any>;
}
export interface QdrantSearchResult {
    id: string;
    score: number;
    payload: Record<string, any>;
}
/**
 * QdrantService
 * Handles vector storage and retrieval using Qdrant Cloud.
 */
export declare class QdrantService {
    private configService;
    private client;
    private collectionName;
    private baseUrl;
    private apiKey;
    constructor(configService: ConfigService);
    /**
     * Initialize collection if it doesn't exist
     */
    initializeCollection(vectorSize?: number): Promise<void>;
    /**
     * Upsert a point (document with embedding) into Qdrant
     */
    upsertPoint(point: QdrantPoint): Promise<void>;
    /**
     * Upsert multiple points in batch
     */
    upsertBatch(points: QdrantPoint[]): Promise<void>;
    /**
     * Search for similar vectors
     */
    search(vector: number[], limit?: number, scoreThreshold?: number): Promise<QdrantSearchResult[]>;
    /**
     * Delete a point by ID
     */
    deletePoint(id: string): Promise<void>;
    /**
     * Get collection stats
     */
    getStats(): Promise<any>;
    /**
     * Generate a unique ID for a point
     */
    generateId(): string;
}
//# sourceMappingURL=qdrant.service.d.ts.map