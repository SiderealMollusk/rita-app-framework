import { BaseValueObject } from './BaseValueObject';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { SystemCtx } from './SystemCtx';

/**
 * The Key to the Kingdom.
 * Only the Framework can construct this.
 */
const FrameworkInternals = Symbol("FrameworkInternals");

/**
 * The Key to the Kingdom.
 * Only the Framework can construct this.
 */
export class PolicyToken {
    private readonly _secret = Symbol("PolicyToken");

    // Private constructor prevents `new PolicyToken()` outside
    private constructor(secret: symbol) {
        if (secret !== FrameworkInternals) {
            throw new Error("Cannot instantiate PolicyToken directly!");
        }
    }

    // Internal factory - only accessible if you have the symbol (which is not exported)
    static create(secret: symbol): PolicyToken {
        return new PolicyToken(secret);
    }
}

// Internal Helper for the DecisionPolicy class to use
const createPolicyToken = () => PolicyToken.create(FrameworkInternals);

// Test Helper (Restricted - DO NOT USE IN PRODUCTION CODE)
export const _TEST_createPolicyToken = () => PolicyToken.create(FrameworkInternals);



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
        this.token = createPolicyToken();
    }

    /**
     * IMPERATIVE LOGIC.
     * Write standard TypeScript if/else logic here.
     * Return a list of evolutions to apply.
     */
    protected abstract decide(target: TTarget, context: TContext): Evolution<TTarget>[];

    public execute(ctx: SystemCtx, target: TTarget, context: TContext): TTarget {
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

// TODO(P0-SAFETY): Make PolicyToken unforgeable outside the framework. Currently PolicyToken.create() is public and exported, so any code can mint a token and call _evolve. Fix by moving token creation to a module-private capability (not exported), and do not export PolicyToken (or export only its type, not constructor/factory). DecisionPolicy should be the only code able to authorize evolutions.

// TODO(P1-CQRS): Stop applying evolutions directly in DecisionPolicy if you want “final state wins” at the use-case level. Consider returning a list of evolutions (ChangeRequests) and letting Command commit/apply them in one place. If you keep current behavior, then base command should still own persistence (saveIfChanged) and not autosave per policy.

// TODO(P1): Include target identity in evolution logs when available (e.g., if BaseValueObject has an id field or optional interface), so logs read: “Proposing Evolution on Order:o_demo_1”.

