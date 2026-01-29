import { BaseSecondaryAdapter } from '../BaseSecondaryAdapter';
import { BaseRepository } from '../BaseRepository';
import { AdminRepository } from '../AdminRepository';
import { ContextFactory } from '../../context/promotion/ContextFactory';
import { InMemoryUnitOfWorkFactory } from '../InMemoryUnitOfWork';
import { BaseEntity } from '../../domain/BaseEntity';

class MockEntity extends BaseEntity<{ name: string }> {
    protected validate() {}
}

class MockRepo extends BaseRepository<MockEntity> {
    public async getById(ctx: any, id: string): Promise<MockEntity | null> {
        return new MockEntity(id, { name: 'Test' });
    }
    protected async _doSave(): Promise<void> {}
}

class MockAdminRepo extends AdminRepository {
    protected async _doExecuteRaw<T>(): Promise<T> {
        return { success: true } as T;
    }
    public async runQuery(ctx: any, q: string) {
        return this.executeRaw<{ success: boolean }>(ctx, q);
    }
}

describe('Adapter Primitives', () => {
    describe('BaseSecondaryAdapter', () => {
        it('should trace success', async () => {
            class SimpleAdapter extends BaseSecondaryAdapter {
                public async call(ctx: any) {
                    return this.safeExecute(ctx, 'op', async () => 'ok');
                }
            }
            const adapter = new SimpleAdapter();
            const ctx = ContextFactory.createExternal();
            expect(await adapter.call(ctx)).toBe('ok');
        });

        it('should trace and log failure', async () => {
            class ErrorAdapter extends BaseSecondaryAdapter {
                public async call(ctx: any) {
                    return this.safeExecute(ctx, 'op', async () => { throw new Error('fail'); });
                }
            }
            const adapter = new ErrorAdapter();
            const ctx = ContextFactory.createExternal();
            await expect(adapter.call(ctx)).rejects.toThrow('fail');
        });
    });

    describe('BaseRepository', () => {
        it('should allow reads with internal ctx', async () => {
            const repo = new MockRepo();
            const ctx = ContextFactory.promoteToInternal(ContextFactory.createExternal());
            const result = await repo.getById(ctx, '1');
            expect(result?.id).toBe('1');
        });

        it('should require CommitCap for save', async () => {
            const repo = new MockRepo();
            const internal = ContextFactory.promoteToInternal(ContextFactory.createExternal());
            const entity = new MockEntity('1', { name: 'Test' });

            // Should fail with internal ctx
            await expect(repo.save(internal as any, entity)).rejects.toThrow('Missing required capability: CommitCap');

            // Should pass with command ctx
            const command = ContextFactory.promoteToCommand(internal);
            await repo.save(command, entity);
        });
    });

    describe('AdminRepository', () => {
        it('should require RawQueryCap', async () => {
            const repo = new MockAdminRepo();
            const internal = ContextFactory.promoteToInternal(ContextFactory.createExternal());

            await expect(repo.runQuery(internal as any, 'SELECT 1')).rejects.toThrow('Missing required capability: RawQueryCap');

            const system = ContextFactory.elevateToSystem(internal);
            const result = await repo.runQuery(system, 'SELECT 1');
            expect(result.success).toBe(true);
        });
    });

    describe('UnitOfWork', () => {
        it('should start UoW with CommandCtx', async () => {
            const factory = new InMemoryUnitOfWorkFactory();
            const internal = ContextFactory.promoteToInternal(ContextFactory.createExternal());

            await expect(factory.start(internal as any)).rejects.toThrow('CommitCap');

            const command = ContextFactory.promoteToCommand(internal);
            const uow = await factory.start(command);
            expect(uow).toBeDefined();
            await uow.commit();
            await uow.rollback();
            await uow.close();
        });
    });
});
