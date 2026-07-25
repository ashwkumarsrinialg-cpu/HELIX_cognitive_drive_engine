export declare class AnalyticsService {
    calculateHybridDrift(department: string, textPayload: string): Promise<{
        department: string;
        hybrid_drift_index: number;
        vector_s_strategic: number;
        vector_p_process: number;
        vector_c_conceptual: number;
        vector_m_memory: number;
        matched_policy: string;
        status: string;
    }>;
    evaluatePolicyRules(department: string): Promise<{
        department: string;
        policies_checked: string[];
        active_monitors: number;
        aligned_transmissions: number;
        flagged_signals: number;
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map