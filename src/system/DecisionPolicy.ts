import { BaseValueObject } from './BaseValueObject';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';

/**
 * The Key to the Kingdom.
 * Only the Framework can construct this.
 */
export class PolicyToken {
    private readonly _secret = Symbol("PolicyToken");

    // Internal factory - in a real package this would be hidden
    static create(): PolicyToken {
        return new PolicyToken();
    }
}

// Data-Driven Evolution (No Functions!)
export type Evolution<TTarget extends BaseValueObject<any>> = {
    changes: Partial<TTarget['_data']>;
    note: string; // The "Reason" is now mandatory
};

/**
 * The Decision Policy (Logic Engine).
 * 
 * Enforces:
 * 1. Logic is encapsulated in `decide()`
 * 2. Evolution is Attributed (PolicyToken)
 * 3. Execution is Traced
 */
export abstract class DecisionPolicy<TTarget extends BaseValueObject<any>, TContext = void> {
    protected readonly name: string;
    private readonly token: PolicyToken;

    constructor() {
        this.name = this.constructor.name;
        this.token = PolicyToken.create();
    }

    /**
     * IMPERATIVE LOGIC.
     * Write standard TypeScript if/else logic here.
     * Return a list of evolutions to apply.
     */
    protected abstract decide(target: TTarget, context: TContext): Evolution<TTarget>[];

    public execute(ctx: RitaCtx, target: TTarget, context: TContext): TTarget {
        const span = Tracer.startSpan(this.name, ctx);

        try {
            // Run the Policy Logic
            const evolutions = this.decide(target, context);

            let currentTarget = target;
            let evolutionsApplied = 0;

            if (evolutions.length === 0) {
                Logger.debug(`[Policy: ${this.name}] No Evolutions Decided. (Identity)`);
            }

            for (const evolution of evolutions) {
                // TRACE: Log what the policy decided
                Logger.info(`[Policy: ${this.name}] Proposing Evolution`, {
                    reason: evolution.note,
                    changes: evolution.changes
                });

                // PRIVILEGED EVOLUTION
                currentTarget = currentTarget._evolve(
                    evolution.changes,
                    `[Policy: ${this.name}] ${evolution.note}`,
                    this.token
                );
                evolutionsApplied++;
            }

            if (evolutionsApplied > 0) {
                Logger.info(`[Policy: ${this.name}] Execution Complete. ${evolutionsApplied} Evolutions Applied.`);
            }

            span.end();
            return currentTarget;

        } catch (err: any) {
            span.recordException(err);
            span.end();
            throw err;
        }
    }
}
