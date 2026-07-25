import { Pipe, PipeInterface, ArgumentMetadata } from '@nitrostack/core';

@Pipe()
export class TrimPipe implements PipeInterface<Record<string, unknown>, Record<string, unknown>> {
  transform(value: Record<string, unknown>, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') return value;
    const trimmed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      trimmed[key] = typeof val === 'string' ? val.trim() : val;
    }
    return trimmed;
  }
}
