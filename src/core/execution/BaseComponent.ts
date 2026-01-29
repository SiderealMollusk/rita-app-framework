import { BaseCtx } from '../context/BaseCtx';
import { Tracer } from '../telemetry/Tracer';
import { Logger } from '../telemetry/Logger';

/**
 * An application orchestration unit (Use Case / Query / Command).
 */
export abstract class BaseComponent<TIn, TOut> {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    /**
     * Implementation of the component logic.
     */
    protected abstract _run(ctx: BaseCtx, input: TIn): Promise<TOut>;

    /**
     * Orchestrates execution with tracing and logging.
     */
    public async execute(ctx: BaseCtx, input: TIn): Promise<TOut> {
        const span = Tracer.startSpan(`[Component] ${this.name}`, ctx);

        try {
            Logger.info(`[Component: ${this.name}] Starting execution`, { traceId: ctx.traceId });
            const result = await this._run(ctx, input);
            Logger.info(`[Component: ${this.name}] Completed execution`, { traceId: ctx.traceId });
            span.end();
            return result;
        } catch (err: any) {
            Logger.error(`[Component: ${this.name}] Failed execution`, {
                traceId: ctx.traceId,
                error: err.message
            });
            span.recordException(err);
            span.end();
            throw err;
        }
    }
}
