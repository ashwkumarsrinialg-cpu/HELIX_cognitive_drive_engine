import { InterceptorInterface, ExecutionContext, Injectable } from '@nitrostack/core';

@Injectable()
export class TimingInterceptor implements InterceptorInterface {
  async intercept(context: ExecutionContext, next: () => Promise<unknown>): Promise<unknown> {
    const start = Date.now();
    const result = await next();
    const duration = Date.now() - start;
    context.logger.info(`[TimingInterceptor] Tool execution completed in ${duration}ms`);
    return {
      ...(typeof result === 'object' && result !== null ? result : { data: result }),
      _meta: { executionDurationMs: duration, timestamp: new Date().toISOString() }
    };
  }
}
