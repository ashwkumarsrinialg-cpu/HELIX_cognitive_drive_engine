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
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
/**
 * QdrantService
 * Handles vector storage and retrieval using Qdrant Cloud.
 */
let QdrantService = class QdrantService {
    configService;
    client;
    collectionName = 'helix-documents';
    baseUrl;
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = this.configService.get('QDRANT_URL') || 'http://localhost:6333';
        this.apiKey = this.configService.get('QDRANT_API_KEY') || '';
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'api-key': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Initialize collection if it doesn't exist
     */
    async initializeCollection(vectorSize = 1536) {
        try {
            // Check if collection exists
            await this.client.get(`/collections/${this.collectionName}`);
        }
        catch (error) {
            if (error.response?.status === 404) {
                // Create collection
                await this.client.put(`/collections/${this.collectionName}`, {
                    vectors: {
                        size: vectorSize,
                        distance: 'Cosine',
                    },
                });
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Upsert a point (document with embedding) into Qdrant
     */
    async upsertPoint(point) {
        await this.client.put(`/collections/${this.collectionName}/points`, {
            points: [
                {
                    id: point.id,
                    vector: point.vector,
                    payload: point.payload,
                },
            ],
        });
    }
    /**
     * Upsert multiple points in batch
     */
    async upsertBatch(points) {
        if (points.length === 0)
            return;
        await this.client.put(`/collections/${this.collectionName}/points`, {
            points: points.map(p => ({
                id: p.id,
                vector: p.vector,
                payload: p.payload,
            })),
        });
    }
    /**
     * Search for similar vectors
     */
    async search(vector, limit = 5, scoreThreshold = 0.5) {
        const response = await this.client.post(`/collections/${this.collectionName}/points/search`, {
            vector,
            limit,
            score_threshold: scoreThreshold,
            with_payload: true,
        });
        return response.data.result.map((item) => ({
            id: item.id,
            score: item.score,
            payload: item.payload,
        }));
    }
    /**
     * Delete a point by ID
     */
    async deletePoint(id) {
        await this.client.post(`/collections/${this.collectionName}/points/delete`, {
            points_selector: {
                ids: [id],
            },
        });
    }
    /**
     * Get collection stats
     */
    async getStats() {
        const response = await this.client.get(`/collections/${this.collectionName}`);
        return response.data;
    }
    /**
     * Generate a unique ID for a point
     */
    generateId() {
        return uuidv4();
    }
};
QdrantService = __decorate([
    Injectable({ deps: [ConfigService] }),
    __metadata("design:paramtypes", [ConfigService])
], QdrantService);
export { QdrantService };
//# sourceMappingURL=qdrant.service.js.map