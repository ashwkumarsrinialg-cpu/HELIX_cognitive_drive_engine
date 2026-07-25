import { Module } from '@nitrostack/core';
import { AnalyticsService } from '../../services/analytics.service.js';
import { AnalyticsTools } from './analytics.tools.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TimingInterceptor } from '../../common/interceptors/timing.interceptor.js';
import { HelixExceptionFilter } from '../../common/filters/helix-exception.filter.js';
import { TrimPipe } from '../../common/pipes/trim.pipe.js';

@Module({
  name: 'analytics',
  providers: [
    AnalyticsService,
    AnalyticsTools,
    AuthGuard,
    TimingInterceptor,
    HelixExceptionFilter,
    TrimPipe
  ],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
