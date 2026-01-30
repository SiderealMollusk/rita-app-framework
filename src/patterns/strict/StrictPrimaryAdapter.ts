import { BasePrimaryAdapter } from '../../core/adapters/BasePrimaryAdapter';
import { OperationScope } from '../../core/scope/OperationScope';
import { ContextFactory } from '../../core/context/promotion/ContextFactory';
import { UnitOfWork } from '../../core/ports/UnitOfWorkPort';
import { Strict } from './types';

/**
 * StrictPrimaryAdapter handles the lifecycle of an OperationScope
 * for incoming requests.
 */
export abstract class StrictPrimaryAdapter extends BasePrimaryAdapter implements Strict {
    public readonly _strictVersion = 1;

    /**
     * Creates an OperationScope for a query (Read-only).
     */
    protected createQueryScope(principal: string, traceId?: string): OperationScope {
        const external = this.createExternalCtx(traceId);
        const internal = ContextFactory.promoteToInternal(external, principal);
        return OperationScope.create(internal);
    }

    /**
     * Creates an OperationScope for a command (Read-Write).
     */
    protected createCommandScope(principal: string, uow: UnitOfWork, traceId?: string): OperationScope {
        const external = this.createExternalCtx(traceId);
        const internal = ContextFactory.promoteToInternal(external, principal);
        const command = ContextFactory.promoteToCommand(internal, uow);
        return OperationScope.create(command, { uow });
    }
}
