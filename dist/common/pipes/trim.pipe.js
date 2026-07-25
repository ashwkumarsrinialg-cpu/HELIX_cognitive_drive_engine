var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@nitrostack/core';
let TrimPipe = class TrimPipe {
    transform(value, metadata) {
        if (!value || typeof value !== 'object')
            return value;
        const trimmed = {};
        for (const [key, val] of Object.entries(value)) {
            trimmed[key] = typeof val === 'string' ? val.trim() : val;
        }
        return trimmed;
    }
};
TrimPipe = __decorate([
    Pipe()
], TrimPipe);
export { TrimPipe };
//# sourceMappingURL=trim.pipe.js.map