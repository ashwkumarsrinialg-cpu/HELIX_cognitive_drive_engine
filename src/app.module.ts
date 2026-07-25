import { Module } from '@nitrostack/core';
import { HelixModule } from './modules/helix/helix.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';

@Module({
  name: 'app',
  imports: [HelixModule, AnalyticsModule]
})
export class AppModule {}
