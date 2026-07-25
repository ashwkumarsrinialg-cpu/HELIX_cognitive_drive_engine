var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nitrostack/core';
import { AnalyticsService } from '../../services/analytics.service.js';
import { AnalyticsTools } from './analytics.tools.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TimingInterceptor } from '../../common/interceptors/timing.interceptor.js';
import { HelixExceptionFilter } from '../../common/filters/helix-exception.filter.js';
import { TrimPipe } from '../../common/pipes/trim.pipe.js';
let AnalyticsModule = class AnalyticsModule {
};
AnalyticsModule = __decorate([
    Module({
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
], AnalyticsModule);
export { AnalyticsModule };
//# sourceMappingURL=analytics.module.js.map