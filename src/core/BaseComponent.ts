import { Logger, LogContext } from './telemetry/Logger';
import { ZodSchema } from './Schema';
import { AgentGuidanceError } from './AgentGuidanceError';

import { Tracer } from './telemetry/Tracer';
import { SystemCtx } from './SystemCtx';

/**
 * Base Application Component (Use Case).
 * 
 * All Use Case implementations must extend this class.
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

    // Optional Runtime Schema Validation "Lubricate & Hard Pass"
    protected schema?: ZodSchema;

    constructor() {
        this.name = this.constructor.name;
    }


    /**
     * The Public Entry Point.
     * Agents cannot override this (in spirit, though TS doesn't have 'final').
     */
    public async execute(ctx: SystemCtx, input: TInput): Promise<TOutput> {
        const span = Tracer.startSpan(this.name, ctx);

        // Add traceId to the Logger context for this execution
        const executionContext: LogContext = {
            traceId: span.traceId,
            component: this.name
        };

        try {
            // 0. Runtime Schema Validation ("Lubricate & Hard Pass")
            if (this.schema) {
                try {
                    this.schema.parse(input);
                } catch (zodError: any) {
                    throw new AgentGuidanceError(
                        "Input Validation Failed",
                        `Input does not match the required Schema: ${JSON.stringify(zodError.errors)}. Ensure you are passing the correct data structure.`
                    );
                }
            }

            Logger.info(`[${this.name}] Started`, {
                ...executionContext,
                input: this.sanitize(input) // Prevent massive logs if input is huge
            });

            // Delegate execution to the implementation, propagating the trace context.
            const childCtx: SystemCtx = { ...ctx, traceId: span.traceId };
            const result = await this._run(childCtx, input);

            Logger.info(`[${this.name}] Completed`, executionContext);
            span.end();

            return result;

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            Logger.error(`[${this.name}] Failed`, {
                ...executionContext,
                error: errorMessage
            });
            span.recordException(err instanceof Error ? err : new Error(errorMessage));
            span.end();
            throw err;
        }

    }

    /**
     * The internal execution logic.
     * Subclasses must implement this method to perform business logic.
     */
    protected abstract _run(ctx: SystemCtx, input: TInput): Promise<TOutput>;

    /**
     * Optional hook to clean up input for logs (e.g. redact passwords).
     * Defaults to identity.
     */
    protected sanitize(input: TInput): unknown {
        return input;
    }

}

// TODO(P0-CQRS): Migrate remaining examples/tests to BaseCommand and BaseQuery.

// TODO(P1): Add an invariant test: Query handler cannot write (compile-time via types and/or runtime via commit capability absence).

