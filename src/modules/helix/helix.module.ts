import { Module } from '@nitrostack/core';
import { HelixTools } from './helix.tools.js';

@Module({
  name: 'helix',
  description: 'Enterprise Cognitive Genome Platform Module for HELIX UI Dashboard',
  providers: [HelixTools]
})
export class HelixModule {}
