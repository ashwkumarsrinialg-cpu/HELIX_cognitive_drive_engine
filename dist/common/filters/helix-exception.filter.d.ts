import { ExceptionFilterInterface, ExecutionContext } from '@nitrostack/core';
export declare class HelixExceptionFilter implements ExceptionFilterInterface {
    catch(exception: unknown, context: ExecutionContext): {
        error: boolean;
        statusCode: number;
        message: string;
        timestamp: string;
    };
}
//# sourceMappingURL=helix-exception.filter.d.ts.map