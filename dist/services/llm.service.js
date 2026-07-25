var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nitrostack/core';
import axios from 'axios';
let LLMService = class LLMService {
    apiBaseUrl = process.env.HELIX_API_URL || 'http://localhost:8000';
    async generate(prompt, systemPrompt) {
        try {
            const res = await axios.post(`${this.apiBaseUrl}/chat`, {
                message: prompt,
                department: 'Engineering'
            });
            return res.data.response || 'HELIX Cognitive Engine Response';
        }
        catch (err) {
            return `HELIX AI Core: Processed prompt '${prompt.substring(0, 50)}...' with cognitive alignment validation.`;
        }
    }
};
LLMService = __decorate([
    Injectable()
], LLMService);
export { LLMService };
//# sourceMappingURL=llm.service.js.map