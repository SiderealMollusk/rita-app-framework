import { BaseCtx, TrustLevel } from './BaseCtx';
import { UnitOfWork } from '../ports/UnitOfWorkPort';

/**
 * InternalCtx + write authority.
 */
export interface CommandCtx extends BaseCtx {
    readonly trustLevel: TrustLevel.Command;
    readonly uow?: UnitOfWork;
}
