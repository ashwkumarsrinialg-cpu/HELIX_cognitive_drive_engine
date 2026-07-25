import { ExecutionContext } from '@nitrostack/core';
import { AnalyticsService } from '../../services/analytics.service.js';
export declare class AnalyticsTools {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    calculateHybridDrift(input: {
        department: string;
        textPayload: string;
    }, ctx: ExecutionContext): Promise<{
        department: string;
        hybrid_drift_index: number;
        vector_s_strategic: number;
        vector_p_process: number;
        vector_c_conceptual: number;
        vector_m_memory: number;
        matched_policy: string;
        status: string;
    }>;
    evaluatePolicyRules(input: {
        department: string;
    }, ctx: ExecutionContext): Promise<{
        department: string;
        policies_checked: string[];
        active_monitors: number;
        aligned_transmissions: number;
        flagged_signals: number;
    }>;
    getMetrics(ctx: ExecutionContext): Promise<{
        active_monitors: number;
        aligned_transmissions: number;
        flagged_signals: number;
        timestamp: string;
    }>;
    getPolicyReviewPrompt(args: {
        policyCode: string;
    }, ctx: ExecutionContext): Promise<{
        messages: {
            role: string;
            content: string;
        }[];
    }>;
}
//# sourceMappingURL=analytics.tools.d.ts.map