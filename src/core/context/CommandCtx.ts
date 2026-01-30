import { BaseCtx, TrustLevel } from './BaseCtx';
import { UnitOfWork } from '../ports/UnitOfWorkPort';

/**
 * InternalCtx + write authority.
 */
export interface CommandCtx extends BaseCtx {
    readonly trustLevel: TrustLevel.Command;
    /**
     * @deprecated Use OperationScope.uow instead.
     * Legacy field for backward compatibility.
     */
    readonly uow?: UnitOfWork;
}

