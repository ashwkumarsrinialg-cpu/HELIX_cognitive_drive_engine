export declare class RAGService {
    private apiBaseUrls;
    private makeRequest;
    askQuestion(question: string, department?: string, topK?: number): Promise<any>;
    analyzeDrift(department: string, signals: string[]): Promise<any>;
}
//# sourceMappingURL=rag.service.d.ts.map