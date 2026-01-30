import { BaseCtx } from '../context/BaseCtx';

import { UnitOfWork } from '../ports/UnitOfWorkPort';
import { PolicyToken, MINT_SYMBOL } from '../domain/PolicyToken';
import { DecisionPolicy } from '../domain/DecisionPolicy';
import { Tracer } from '../telemetry/Tracer';

/**
 * The Unit of Execution.
 * Holds Identity (immutable) and Mechanism (mutable/uow).
 */
export class OperationScope {
    private constructor(
        public readonly context: BaseCtx,
        private readonly _uow?: UnitOfWork
    ) { }

    /**
     * Creates a scope. 
     * If uow is provided, this is a Write Scope.
     */
    static create(context: BaseCtx, uow?: UnitOfWork): OperationScope {
        return new OperationScope(context, uow);
    }


    /**
     * Returns the Active UnitOfWork.
     * Throws if this is a Read-Only Scope.
     */
    get uow(): UnitOfWork {
        if (!this._uow) {
            throw new Error("Write Operation Attempted in Read-Only Scope (No Active UoW)");
        }
        return this._uow;
    }

    /**
     * Checks if this scope has write authority.
     */
    hasWriteAuthority(): boolean {
        return !!this._uow;
    }

    /**
     * Forks the scope (Conceptually).
     * In V1, this creates a child span but maintains the SAME UoW (if present).
     * Nested UoWs are banned, so we share the single UoW down the stack.
     */
    fork(operationName: string): OperationScope {
        const subSpan = Tracer.startSpan(operationName, this.context);
        // Note: In real impl, we'd update context.traceId/spanId here.
        // For simulation, we assume context is reused but traced via Span.

        // We pass 'this._uow' because the child scope shares the parent's transaction
        return new OperationScope(this.context, this._uow);
    }

    /**
     * The ONLY way to obtain a PolicyToken.
     */
    authorize<T>(policy: DecisionPolicy<any, any>, action: (token: PolicyToken) => T): T {
        // Future: Check policy.isAllowed(this.context.principal)
        const token = (PolicyToken as any)[MINT_SYMBOL]();
        return action(token);
    }
}

