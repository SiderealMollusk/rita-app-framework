import { InMemoryRepository } from '../InMemoryRepository';
import { BaseEntity } from '../../domain/BaseEntity';
import { InternalCtx } from '../../context/InternalCtx';
import { CommandCtx } from '../../context/CommandCtx';
import { ContextFactory } from '../../context/promotion/ContextFactory';
import { NotFoundError } from '../../errors/NotFoundError';

class MockEntity extends BaseEntity<{ name: string }> {
    constructor(id: string, name: string) {
        super(id, { name });
    }
    protected validate(data: { name: string }): void {
        if (!data.name) throw new Error('Name is required');
    }
}

describe('InMemoryRepository', () => {
    let repo: InMemoryRepository<MockEntity>;
    let internalCtx: InternalCtx;
    let commandCtx: CommandCtx;

    beforeEach(() => {
        repo = new InMemoryRepository<MockEntity>();
        const external = ContextFactory.createExternal();
        internalCtx = ContextFactory.promoteToInternal(external, 'test-user');
        commandCtx = ContextFactory.promoteToCommand(internalCtx);
    });

    it('should save and find an entity', async () => {
        const entity = new MockEntity('1', 'Test');
        await repo.save(commandCtx, entity);

        const found = await repo.findById(internalCtx, '1');
        expect(found).toBe(entity);
    });

    it('should find all entities', async () => {
        await repo.save(commandCtx, new MockEntity('1', 'T1'));
        await repo.save(commandCtx, new MockEntity('2', 'T2'));

        const all = await repo.findAll(internalCtx);
        expect(all).toHaveLength(2);
    });

    it('should throw NotFoundError if entity does not exist', async () => {
        await expect(repo.findById(internalCtx, '999')).rejects.toThrow(NotFoundError);
    });

    it('should return null if getById does not find entity', async () => {
        const found = await repo.getById(internalCtx, '999');
        expect(found).toBeNull();
    });

    it('should delete an entity', async () => {
        await repo.save(commandCtx, new MockEntity('1', 'T1'));
        await repo.delete(commandCtx, '1');

        const found = await repo.getById(internalCtx, '1');
        expect(found).toBeNull();
    });

    it('should register participant with UoW and handle rollback', async () => {
        const mockRegister = jest.fn();
        const mockUoWCtx = {
            ...commandCtx,
            uow: {
                registerParticipant: mockRegister
            }
        } as any;

        const entity = new MockEntity('1', 'T1');
        await repo.save(mockUoWCtx, entity);

        expect(mockRegister).toHaveBeenCalled();
        const participant = mockRegister.mock.calls[0][0];

        // Execute commit
        await participant.commit();
        const found = await repo.getById(internalCtx, '1');
        expect(found).toBe(entity);

        // Execute rollback (noop but needs coverage)
        await participant.rollback();
    });
});

