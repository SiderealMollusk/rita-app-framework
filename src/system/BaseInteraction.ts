import { BaseComponent } from './BaseComponent';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { SystemCtx } from './SystemCtx';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryCommitScope } from './persistence/InMemoryCommitScope'; // Default implementation

/**
 * The Inbound Boundary (Controller/CLI/Event Handler).
 */
export abstract class BaseInteraction<TInput, TOutput> {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    public abstract run(input: TInput): Promise<TOutput>;

    /**
     * Shared logic to run a use case.
     * @param useCase The use case to run
     * @param input Input data
     * @param isCommand Whether this involves writes (needs commit capability)
     */
    protected async executeUseCaseInternal<UIn, UOut>(
        useCase: BaseComponent<UIn, UOut>,
        input: UIn,
        isCommand: boolean
    ): Promise<UOut> {
        const traceId = uuidv4();

        let ctx: SystemCtx = { traceId };

        if (isCommand) {
            // Attach Commit Capability
            ctx = {
                ...ctx,
                commit: async (fn) => {
                    // Default Implementation: In-Memory Scope (for now)
                    // In real app, this would wrap a DB Transaction
                    const scope = new InMemoryCommitScope();
                    // Future: await db.transaction(async (tx) => { ... })
                    await fn(scope);
                }
            };
        }

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

export abstract class QueryInteraction<TIn, TOut> extends BaseInteraction<TIn, TOut> {
    protected async executeUseCase<UIn, UOut>(useCase: BaseComponent<UIn, UOut>, input: UIn): Promise<UOut> {
        return this.executeUseCaseInternal(useCase, input, false); // No Commit
    }
}

export abstract class CommandInteraction<TIn, TOut> extends BaseInteraction<TIn, TOut> {
    protected async executeUseCase<UIn, UOut>(useCase: BaseComponent<UIn, UOut>, input: UIn): Promise<UOut> {
        return this.executeUseCaseInternal(useCase, input, true); // Has Commit
    }
}



