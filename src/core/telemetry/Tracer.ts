import { BaseCtx } from '../context/BaseCtx';

export interface Span {
    traceId: string;
    end(): void;
    recordException(err: Error): void;
}

export class Tracer {
    static startSpan(name: string, ctx: BaseCtx): Span {
        // Basic implementation for now
        return {
            traceId: ctx.traceId,
            end: () => {},
            recordException: (err) => {}
        };
    }
}
