import {
  ToolDecorator as Tool,
  ResourceDecorator as Resource,
  PromptDecorator as Prompt,
  Cache,
  RateLimit,
  UseGuards,
  UseInterceptors,
  UseFilters,
  UsePipes,
  ExecutionContext,
  z,
  Injectable,
  emitEvent
} from '@nitrostack/core';
import { AnalyticsService } from '../../services/analytics.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TimingInterceptor } from '../../common/interceptors/timing.interceptor.js';
import { HelixExceptionFilter } from '../../common/filters/helix-exception.filter.js';
import { TrimPipe } from '../../common/pipes/trim.pipe.js';

@Injectable()
export class AnalyticsTools {
  constructor(private analyticsService: AnalyticsService) {}

  @Tool({
    name: 'calculate_hybrid_drift',
    description: 'Execute hybrid drift analysis from cognitive_drive_engine module',
    inputSchema: z.object({
      department: z.string().describe('Department name'),
      textPayload: z.string().describe('Telemetry payload text')
    })
  })
  @Cache({ ttl: 60 })
  @UseGuards(AuthGuard)
  @UseInterceptors(TimingInterceptor)
  @UseFilters(HelixExceptionFilter)
  @UsePipes(TrimPipe)
  async calculateHybridDrift(input: { department: string; textPayload: string }, ctx: ExecutionContext) {
    const res = await this.analyticsService.calculateHybridDrift(input.department, input.textPayload);
    emitEvent('analytics.drift.calculated', { department: input.department });
    return res;
  }

  @Tool({
    name: 'evaluate_policy_rules',
    description: 'Evaluate enterprise policy baselines (SEC-01, PRC-02, LEG-01)',
    inputSchema: z.object({
      department: z.string().describe('Department to evaluate')
    })
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(TimingInterceptor)
  @UseFilters(HelixExceptionFilter)
  async evaluatePolicyRules(input: { department: string }, ctx: ExecutionContext) {
    const res = await this.analyticsService.evaluatePolicyRules(input.department);
    return res;
  }

  @Resource({
    uri: 'cognitive://analytics/metrics',
    name: 'Cognitive Engine Metrics',
    description: 'Live operational metrics from cognitive_drive_engine',
    mimeType: 'application/json'
  })
  async getMetrics(ctx: ExecutionContext) {
    return {
      active_monitors: 14,
      aligned_transmissions: 9,
      flagged_signals: 5,
      timestamp: new Date().toISOString()
    };
  }

  @Prompt({
    name: 'policy_compliance_review',
    description: 'Generate policy compliance review instructions for enterprise leads',
    arguments: [
      { name: 'policyCode', description: 'Policy Code (e.g. SEC-01)', required: true }
    ]
  })
  async getPolicyReviewPrompt(args: { policyCode: string }, ctx: ExecutionContext) {
    return {
      messages: [
        {
          role: 'user',
          content: `You are the HELIX Compliance Engine. Generate a formal compliance review for policy baseline ${args.policyCode}.`
        }
      ]
    };
  }
}
