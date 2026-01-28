import { BaseComponent } from './BaseComponent';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';
import { v4 as uuidv4 } from 'uuid'; // Need to npm install uuid or just shim it for now

/**
 * The Inbound Boundary (Controller/CLI/Event Handler).
 * 
 * This class abstracts the "entry point" to the application.
 * It is the ONLY place that is allowed to parse "Dirty" input (JSON/CLI Args)
 * and convert it into "Clean" Domain Objects (Entities/VOs).
 * 
 * Rules:
 * 1. Can ONLY call BaseComponent (Use Cases).
 * 2. Cannot contain business logic.
 * 3. Handles request/response translation.
 */
export abstract class BaseInteraction<TInput, TOutput> {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    public abstract run(input: TInput): Promise<TOutput>;

    /**
     * Helper to execute a Use Case safely.
     * Wraps the call in a Span and ensures errors are logged at the boundary.
     * 
     * THIS acts as the "Context Root" - creating the fresh Trace ID.
     */
    protected async executeUseCase<UIn, UOut>(
        useCase: BaseComponent<UIn, UOut>,
        input: UIn
    ): Promise<UOut> {
        // We create the Root Span (no parent)
        const traceId = uuidv4();
        const ctx: RitaCtx = { traceId };

        const span = Tracer.startSpan(`[Interaction] ${this.name} -> ${useCase.constructor.name}`, ctx);

        try {
            const result = await useCase.execute(ctx, input);
            span.end();
            return result;
        } catch (err: any) {
            Logger.error(`[Interaction] ${this.name} failed to execute ${useCase.constructor.name}`, {
                error: err.message,
                traceId: span.traceId
            });
            span.recordException(err);
            span.end();
            throw err;
        }
    }
}

// TODO(P0-CQRS): Add an explicit “interaction kind” concept: QueryInteraction vs CommandInteraction (or a flag on executeUseCase) to construct RitaCtx with/without commit capability. Commands get ctx.commit; queries do not.

// TODO(P1): Add idempotencyKey plumbing option at the interaction boundary (optional input field or derived key) but keep “punt” unless needed; document intended usage.

