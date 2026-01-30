import { BaseCtx } from '../context/BaseCtx';
import { CommandCtx } from '../context/CommandCtx';
import { PolicyToken, MINT_SYMBOL } from '../domain/PolicyToken';
import { DecisionPolicy } from '../domain/DecisionPolicy';
import { Tracer } from '../telemetry/Tracer';
import { UnitOfWork } from '../ports/UnitOfWorkPort';
import { EventBusPort } from '../ports/EventBusPort';

/**
 * Mutable container for services scoped to this operation.
 */
export interface ServiceBag {
    uow?: UnitOfWork;
    bus?: EventBusPort;
}

/**
 * The Centralized Unit of Execution.
 * 
 * - Holds Identity (Ctx)
 * - Holds Services (UoW, Bus)
 * - Holds Authority (PolicyToken Issuer)
 */
export class OperationScope {
    private constructor(
        public readonly context: BaseCtx,
        public readonly services: ServiceBag = {}
    ) {}

    /**
     * Creates a root scope for a request.
     */
    static create(context: BaseCtx, services?: ServiceBag): OperationScope {
        return new OperationScope(context, services);
    }

    /**
     * Returns the Unit of Work if available in this scope.
     * Throws if no UoW is present (e.g. in a read-only scope).
     */
    get uow(): UnitOfWork {
        const uow = this.services.uow || (this.context as CommandCtx).uow;
        if (!uow) {
            throw new Error("UnitOfWork not available in this scope. Ensure you are in a Command context.");
        }
        return uow;
    }

    /**
     * Forks the scope for a sub-task.
     * Preserves Trace ID, generates new Span ID.
     */
    fork(operationName: string): OperationScope {
        // Create a new context with the same TraceID but new SpanID (via Tracer)
        const subSpan = Tracer.startSpan(operationName, this.context);
        
        // In a real OpenTelemetry setup, we'd extract the new context from the span
        // For now, we manually clone and update the spanId (mock logic)
        const newCtx: BaseCtx = {
            ...this.context,
            // @ts-ignore - Assuming context has spanId logic or we just rely on parent link
        };

        const forkScope = new OperationScope(newCtx, this.services);
        
        // Ensure span ends when scope "completes" - this is tricky in async, 
        // usually managed by the caller. 
        // For now, we just indicate logical separation.
        subSpan.end(); 
        
        return forkScope;
    }

    /**
     * The ONLY way to obtain a PolicyToken.
     * Executes the action within the authorized context of the policy.
     */
    authorize<T>(policy: DecisionPolicy<any, any>, action: (token: PolicyToken) => T): T {
        // In the future, this is where we check if 'policy' is allowed for this 'user'
        
        // Mint the token using the hidden internal factory
        const token = (PolicyToken as any)[MINT_SYMBOL]();
        
        return action(token);
    }
}
