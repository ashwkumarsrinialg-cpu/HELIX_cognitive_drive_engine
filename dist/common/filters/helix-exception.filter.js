var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nitrostack/core';
let HelixExceptionFilter = class HelixExceptionFilter {
    catch(exception, context) {
        const message = exception instanceof Error ? exception.message : 'Unknown exception occurred';
        context.logger.error(`[HelixExceptionFilter] Exception caught: ${message}`);
        return {
            error: true,
            statusCode: 500,
            message,
            timestamp: new Date().toISOString()
        };
    }
};
HelixExceptionFilter = __decorate([
    Injectable()
], HelixExceptionFilter);
export { HelixExceptionFilter };
//# sourceMappingURL=helix-exception.filter.js.map