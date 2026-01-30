import { CommandCtx } from '../context/CommandCtx';
import { UnitOfWork } from './UnitOfWorkPort';

/**
 * Factory for creating Units of Work.
 * Enforces "No Nested UoW" and "CommandCtx Only".
 */
export interface UnitOfWorkFactoryPort {
    /**
     * Opens a new UnitOfWork.
     * @throws {Error} if a UoW is already active for this context/scope.
     * @throws {UnauthorizedError} if ctx is not a CommandCtx.
     */
    open(ctx: CommandCtx): Promise<UnitOfWork>;
}
