import { ExceptionFilterInterface, ExecutionContext, Injectable } from '@nitrostack/core';

@Injectable()
export class HelixExceptionFilter implements ExceptionFilterInterface {
  catch(exception: unknown, context: ExecutionContext) {
    const message = exception instanceof Error ? exception.message : 'Unknown exception occurred';
    context.logger.error(`[HelixExceptionFilter] Exception caught: ${message}`);
    return {
      error: true,
      statusCode: 500,
      message,
      timestamp: new Date().toISOString()
    };
  }
}
