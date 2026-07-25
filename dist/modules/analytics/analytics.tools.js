var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, ResourceDecorator as Resource, PromptDecorator as Prompt, Cache, UseGuards, UseInterceptors, UseFilters, UsePipes, z, Injectable, emitEvent } from '@nitrostack/core';
import { AnalyticsService } from '../../services/analytics.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TimingInterceptor } from '../../common/interceptors/timing.interceptor.js';
import { HelixExceptionFilter } from '../../common/filters/helix-exception.filter.js';
import { TrimPipe } from '../../common/pipes/trim.pipe.js';
let AnalyticsTools = class AnalyticsTools {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async calculateHybridDrift(input, ctx) {
        const res = await this.analyticsService.calculateHybridDrift(input.department, input.textPayload);
        emitEvent('analytics.drift.calculated', { department: input.department });
        return res;
    }
    async evaluatePolicyRules(input, ctx) {
        const res = await this.analyticsService.evaluatePolicyRules(input.department);
        return res;
    }
    async getMetrics(ctx) {
        return {
            active_monitors: 14,
            aligned_transmissions: 9,
            flagged_signals: 5,
            timestamp: new Date().toISOString()
        };
    }
    async getPolicyReviewPrompt(args, ctx) {
        return {
            messages: [
                {
                    role: 'user',
                    content: `You are the HELIX Compliance Engine. Generate a formal compliance review for policy baseline ${args.policyCode}.`
                }
            ]
        };
    }
};
__decorate([
    Tool({
        name: 'calculate_hybrid_drift',
        description: 'Execute hybrid drift analysis from cognitive_drive_engine module',
        inputSchema: z.object({
            department: z.string().describe('Department name'),
            textPayload: z.string().describe('Telemetry payload text')
        })
    }),
    Cache({ ttl: 60 }),
    UseGuards(AuthGuard),
    UseInterceptors(TimingInterceptor),
    UseFilters(HelixExceptionFilter),
    UsePipes(TrimPipe),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsTools.prototype, "calculateHybridDrift", null);
__decorate([
    Tool({
        name: 'evaluate_policy_rules',
        description: 'Evaluate enterprise policy baselines (SEC-01, PRC-02, LEG-01)',
        inputSchema: z.object({
            department: z.string().describe('Department to evaluate')
        })
    }),
    UseGuards(AuthGuard),
    UseInterceptors(TimingInterceptor),
    UseFilters(HelixExceptionFilter),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsTools.prototype, "evaluatePolicyRules", null);
__decorate([
    Resource({
        uri: 'cognitive://analytics/metrics',
        name: 'Cognitive Engine Metrics',
        description: 'Live operational metrics from cognitive_drive_engine',
        mimeType: 'application/json'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsTools.prototype, "getMetrics", null);
__decorate([
    Prompt({
        name: 'policy_compliance_review',
        description: 'Generate policy compliance review instructions for enterprise leads',
        arguments: [
            { name: 'policyCode', description: 'Policy Code (e.g. SEC-01)', required: true }
        ]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsTools.prototype, "getPolicyReviewPrompt", null);
AnalyticsTools = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AnalyticsService])
], AnalyticsTools);
export { AnalyticsTools };
//# sourceMappingURL=analytics.tools.js.map