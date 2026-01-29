import { CommandCtx } from '../context/CommandCtx';

/**
 * Manages the lifecycle of a set of atomic operations.
 */
export interface UnitOfWork {
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
}

/**
 * Factory for creating Units of Work.
 */
export interface UnitOfWorkPort {
    start(ctx: CommandCtx): Promise<UnitOfWork>;
}
