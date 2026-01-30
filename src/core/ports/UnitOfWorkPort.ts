import { CommandCtx } from '../context/CommandCtx';

/**
 * Manages the lifecycle of a set of atomic operations.
 */
export interface UnitOfWork {
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
}

import { UnitOfWorkFactoryPort } from './UnitOfWorkFactoryPort';

/**
 * Factory for creating Units of Work.
 * @deprecated Use UnitOfWorkFactoryPort instead.
 */
export interface UnitOfWorkPort extends UnitOfWorkFactoryPort {
    /**
     * @deprecated Use open(ctx) instead.
     */
    start(ctx: CommandCtx): Promise<UnitOfWork>;
}

