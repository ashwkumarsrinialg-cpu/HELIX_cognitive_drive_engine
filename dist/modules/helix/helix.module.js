var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nitrostack/core';
import { HelixTools } from './helix.tools.js';
import { LLMService } from '../../services/llm.service.js';
import { RAGService } from '../../services/rag.service.js';
let HelixModule = class HelixModule {
};
HelixModule = __decorate([
    Module({
        name: 'helix',
        providers: [LLMService, RAGService, HelixTools]
    })
], HelixModule);
export { HelixModule };
//# sourceMappingURL=helix.module.js.map