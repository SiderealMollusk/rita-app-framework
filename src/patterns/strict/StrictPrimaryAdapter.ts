import { BasePrimaryAdapter } from '../../core/adapters/BasePrimaryAdapter';
import { OperationScope } from '../../core/scope/OperationScope';
import { ContextFactory } from '../../core/context/promotion/ContextFactory';
import { UnitOfWorkFactoryPort } from '../../core/ports/UnitOfWorkFactoryPort';
import { Strict } from './types';

/**
 * StrictPrimaryAdapter handles the lifecycle of an OperationScope
 * for incoming requests.
 */
export abstract class StrictPrimaryAdapter extends BasePrimaryAdapter implements Strict {
    public readonly _strictVersion = 1;

    constructor(
        protected readonly uowFactory: UnitOfWorkFactoryPort
    ) {
        super();
    }

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
     * Opens a UoW using the Factory.
     */
    protected async createCommandScope(principal: string, traceId?: string): Promise<OperationScope> {
        const external = this.createExternalCtx(traceId);
        const internal = ContextFactory.promoteToInternal(external, principal);
        // Promote to Command (Gain CommitCap) - Note: separate from UoW
        const commandCtx = ContextFactory.promoteToCommand(internal);

        // Open UoW (Law 2 & 5 Enforcement)
        const uow = await this.uowFactory.open(commandCtx);

        return OperationScope.create(commandCtx, uow);
    }
}

