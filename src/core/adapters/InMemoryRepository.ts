import { BaseRepository } from './BaseRepository';
import { BaseEntity } from '../domain/BaseEntity';
import { BaseCtx } from '../context/BaseCtx';
import { InternalCtx } from '../context/InternalCtx';
import { CommandCtx } from '../context/CommandCtx';
import { NotFoundError } from '../errors/NotFoundError';

/**
 * Generic In-Memory Repository for testing and simulation.
 */
export class InMemoryRepository<T extends BaseEntity<any, any>> extends BaseRepository<T> {
    protected data = new Map<string, T>();

    public async getById(ctx: BaseCtx, id: string): Promise<T | null> {
        return this.safeExecute(ctx, 'getById', async () => {
            return this.data.get(id) || null;
        });
    }

    /**
     * Helper for finding with strict non-null requirement.
     */
    public async findById(ctx: InternalCtx, id: string): Promise<T> {
        const entity = await this.getById(ctx, id);
        if (!entity) throw new NotFoundError(this.constructor.name, id);
        return entity;
    }

    public async findAll(ctx: InternalCtx): Promise<T[]> {
        return this.safeExecute(ctx, 'findAll', async () => {
            return Array.from(this.data.values());
        });
    }

    protected async _doSave(ctx: CommandCtx, entity: T): Promise<void> {
        const uow = ctx.uow as any;
        if (uow && typeof uow.registerParticipant === 'function') {
            uow.registerParticipant({
                commit: async () => { this.data.set(entity.id as string, entity); },
                rollback: async () => {}
            });
        } else {
            this.data.set(entity.id as string, entity);
        }
    }

    public async delete(ctx: CommandCtx, id: string): Promise<void> {
        return this.safeExecute(ctx, 'delete', async () => {
            this.data.delete(id);
        });
    }
}
