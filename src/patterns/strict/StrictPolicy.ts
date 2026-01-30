import { DecisionPolicy, Evolution } from '../../core/domain/DecisionPolicy';
import { StrictEntity } from './StrictEntity';
import { OperationScope } from '../../core/scope/OperationScope';
import { Strict } from './types';

/**
 * StrictPolicy ensures that decision logic only operates on StrictEntities
 * and requires an OperationScope for execution.
 */
export abstract class StrictPolicy<TTarget extends StrictEntity<any, any>, TContext = void>
    extends DecisionPolicy<TTarget, TContext> implements Strict {

    public readonly _strictVersion = 1;

    /**
     * Executes the policy and applies proposed evolutions.
     * Requires an OperationScope to ensure authorized execution.
     */
    public run(scope: OperationScope, target: TTarget, context: TContext): TTarget {
        // Use the underlying DecisionPolicy execute method
        return this.execute(scope.context as any, target, context);
    }

    /**
     * Implementation of the decision logic.
     * Subclasses must return an array of Evolutions.
     */
    protected abstract decide(target: TTarget, context: TContext): Evolution<TTarget>[];
}
