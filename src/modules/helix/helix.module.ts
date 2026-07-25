import { Module } from '@nitrostack/core';
import { HelixTools } from './helix.tools.js';
import { LLMService } from '../../services/llm.service.js';
import { RAGService } from '../../services/rag.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TimingInterceptor } from '../../common/interceptors/timing.interceptor.js';
import { HelixExceptionFilter } from '../../common/filters/helix-exception.filter.js';
import { TrimPipe } from '../../common/pipes/trim.pipe.js';

@Module({
  name: 'helix',
  providers: [
    LLMService,
    RAGService,
    HelixTools,
    AuthGuard,
    TimingInterceptor,
    HelixExceptionFilter,
    TrimPipe
  ]
})
export class HelixModule {}
