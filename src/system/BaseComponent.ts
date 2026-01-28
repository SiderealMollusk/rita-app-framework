import { Logger, LogContext } from './telemetry/Logger';
import { Tracer, Span } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';

/**
 * The "Invisible Railings" Logic Wrapper.
 * 
 * Agents must extend this class for all Use Cases.
 * It enforces:
 * 1. Automatic Tracing (Spans)
 * 2. Automatic Logging (Start/End/Fail)
 * 3. Error Boundary (Catch & Record)
 * 
 * TInput: The DTO/ValueObject passed in.
 * TOutput: The DTO/ValueObject returned.
 */
export abstract class BaseComponent<TInput, TOutput> {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    /**
     * The Public Entry Point.
     * Agents cannot override this (in spirit, though TS doesn't have 'final').
     */
    public async execute(ctx: RitaCtx, input: TInput): Promise<TOutput> {
        const span = Tracer.startSpan(this.name, ctx);

        // Add traceId to the Logger context for this execution
        const executionContext: LogContext = {
            traceId: span.traceId,
            component: this.name
        };

        Logger.info(`[${this.name}] Started`, {
            ...executionContext,
            input: this.sanitize(input) // Prevent massive logs if input is huge
        });

        try {
            // THE HOLE
            // We pass the NEW span ID as the traceId for the child
            const childCtx: RitaCtx = { ...ctx, traceId: span.traceId };
            const result = await this._run(childCtx, input);

            Logger.info(`[${this.name}] Completed`, executionContext);
            span.end();

            return result;

        } catch (err: any) {
            Logger.error(`[${this.name}] Failed`, {
                ...executionContext,
                error: err.message
            });
            span.recordException(err);
            span.end();
            throw err;
        }
    }

    /**
     * The Logic Hole.
     * Agents implement this method to perform business logic.
     */
    protected abstract _run(ctx: RitaCtx, input: TInput): Promise<TOutput>;

    /**
     * Optional hook to clean up input for logs (e.g. redact passwords).
     * Defaults to identity.
     */
    protected sanitize(input: TInput): any {
        return input;
    }
}

// TODO(P0-CQRS): Split BaseComponent into CQRS-aware base classes. Keep BaseComponent for now but introduce BaseCommand and BaseQuery (new files) and migrate examples/tests to them. BaseCommand is allowed to call ctx.commit; BaseQuery must not have access to commit or writers.

// TODO(P0-CQRS): Remove the confusing comment “THE HOLE We pass NEW span ID as traceId”; instead clarify trace propagation. Confirm childCtx should carry same traceId; do not mutate semantics later.

// TODO(P1): Add an invariant test: Query handler cannot write (compile-time via types and/or runtime via commit capability absence).

