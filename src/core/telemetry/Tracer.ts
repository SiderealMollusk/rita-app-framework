import { BaseCtx } from '../context/BaseCtx';
import { Span } from './Span';

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
