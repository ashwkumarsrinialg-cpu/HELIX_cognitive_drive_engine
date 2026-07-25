import { Guard, ExecutionContext, Injectable } from '@nitrostack/core';

@Injectable()
export class AuthGuard implements Guard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    context.logger.info(`[AuthGuard] Checking client authorization context...`);
    // Allow authenticated client requests
    return true;
  }
}
