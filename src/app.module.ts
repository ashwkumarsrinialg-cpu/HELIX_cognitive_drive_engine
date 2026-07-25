import { Module } from '@nitrostack/core';
import { HelixModule } from './modules/helix/helix.module.js';

@Module({
  name: 'app',
  imports: [HelixModule]
})
export class AppModule {}
