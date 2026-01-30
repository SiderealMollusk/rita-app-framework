import { BaseCtx } from '../context/BaseCtx';
import { Tracer } from '../telemetry/Tracer';
import { Logger } from '../telemetry/Logger';
import { SecondaryPort } from '../ports/SecondaryPort';

/**
 * Base class for external system adapters (API, queue, etc.).
 * @deprecated Use StrictSecondaryAdapter instead for better safety and enforcement.
 */
export abstract class BaseSecondaryAdapter implements SecondaryPort {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    /**
     * Wraps an external call with tracing and logging.
     */
    protected async safeExecute<T>(
        ctx: BaseCtx,
        operationName: string,
        fn: () => Promise<T>
    ): Promise<T> {
        const span = Tracer.startSpan(`[SecondaryAdapter] ${this.name}:${operationName}`, ctx);

        try {
            const result = await fn();
            span.end();
            return result;
        } catch (err: any) {
            Logger.error(`[SecondaryAdapter: ${this.name}] Operation ${operationName} failed`, {
                traceId: ctx.traceId,
                error: err.message
            });
            span.recordException(err);
            span.end();
            throw err;
        }
    }
}
