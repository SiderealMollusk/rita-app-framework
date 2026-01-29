import { BaseValueObject } from './BaseValueObject';
import { PolicyToken } from './PolicyToken';
import { InternalCtx } from '../context/InternalCtx';
import { Tracer } from '../telemetry/Tracer';
import { Logger } from '../telemetry/Logger';

export interface Evolution<T extends BaseValueObject<any>> {
    changes: Partial<T['_data']>;
    note: string;
}

/**
 * Pure decision logic that proposes state evolutions.
 */
export abstract class DecisionPolicy<TTarget extends BaseValueObject<any>, TContext = void> {
    protected readonly name: string;
    protected readonly token: PolicyToken;

    constructor() {
        this.name = this.constructor.name;
        this.token = PolicyToken.createInternal();
    }

    /**
     * Logic implementation. Should be pure and deterministic.
     */
    protected abstract decide(target: TTarget, context: TContext): Evolution<TTarget>[];

    /**
     * Executes the policy and applies proposed evolutions.
     */
    public execute(ctx: InternalCtx, target: TTarget, context: TContext): TTarget {
        const span = Tracer.startSpan(`[Policy] ${this.name}`, ctx);

        try {
            const evolutions = this.decide(target, context);
            let current = target;

            for (const evo of evolutions) {
                current = current._evolve(
                    evo.changes,
                    `[Policy: ${this.name}] ${evo.note}`,
                    this.token
                );

                Logger.info(`[Evolution] ${evo.note}`, {
                    traceId: ctx.traceId,
                    component: this.name,
                    evolution: evo.changes,
                    snapshot: current._data,
                    reason: evo.note
                });
            }

            span.end();
            return current;
        } catch (err: any) {
            span.recordException(err);
            span.end();
            throw err;
        }
    }
}
