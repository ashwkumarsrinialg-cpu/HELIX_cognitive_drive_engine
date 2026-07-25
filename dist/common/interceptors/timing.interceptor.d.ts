import { InterceptorInterface, ExecutionContext } from '@nitrostack/core';
export declare class TimingInterceptor implements InterceptorInterface {
    intercept(context: ExecutionContext, next: () => Promise<unknown>): Promise<unknown>;
}
//# sourceMappingURL=timing.interceptor.d.ts.map