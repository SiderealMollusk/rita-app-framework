import { BaseCtx } from '../context/BaseCtx';
import { CommandCtx } from '../context/CommandCtx';
import { CommitCap } from '../context/capabilities/CommitCap';
import { BaseSecondaryAdapter } from './BaseSecondaryAdapter';
import { BaseEntity } from '../domain/BaseEntity';

/**
 * Parameterized persistence adapter with safety gates.
 */
export abstract class BaseRepository<T extends BaseEntity<any, any>> extends BaseSecondaryAdapter {
    /**
     * Reads are allowed with any context.
     */
    public abstract getById(ctx: BaseCtx, id: any): Promise<T | null>;

    /**
     * Writes require CommandCtx (which implies CommitCap).
     */
    public async save(ctx: CommandCtx, entity: T): Promise<void> {
        ctx.capabilities.require(CommitCap);
        return this.safeExecute(ctx, 'save', () => this._doSave(ctx, entity));
    }

    protected abstract _doSave(ctx: CommandCtx, entity: T): Promise<void>;
}
