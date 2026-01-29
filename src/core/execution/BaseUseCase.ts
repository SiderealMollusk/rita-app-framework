import { BaseComponent } from './BaseComponent';
import { InternalCtx } from '../context/InternalCtx';
import { CommandCtx } from '../context/CommandCtx';
import { Tracer } from '../telemetry/Tracer';
import { Logger } from '../telemetry/Logger';

/**
 * Orchestrates domain logic and side effects.
 * Acts as the application layer boundary.
 */
export abstract class BaseUseCase<TInput, TOutput> {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    /**
     * Entry point for the primary adapter.
     */
    public abstract run(input: TInput): Promise<TOutput>;

    /**
     * Orchestrates the execution of an application component.
     */
    protected async executeComponent<TIn, TOut>(
        component: BaseComponent<TIn, TOut>,
        ctx: InternalCtx | CommandCtx,
        input: TIn
    ): Promise<TOut> {
        const span = Tracer.startSpan(`[UseCase Boundary] ${this.name}`, ctx);
        try {
            const result = await component.execute(ctx, input);
            span.end();
            return result;
        } catch (err: any) {
            Logger.error(`[UseCase Boundary: ${this.name}] Failed to execute ${component.constructor.name}`, {
                traceId: ctx.traceId,
                error: err.message
            });
            span.recordException(err);
            span.end();
            throw err;
        }
    }
}
