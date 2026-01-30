import { StartCourse } from '../StartCourse';
import { KitchenPolicy } from '../../../L1_Atomic/domain/KitchenPolicy';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { KitchenItem } from '../../../L1_Atomic/domain/KitchenItem';
import { InMemoryRepository, UnitOfWorkFactory, ContextFactory, NotFoundError } from '../../../../../../core';

describe('StartCourse', () => {
    let useCase: StartCourse;
    let repo: InMemoryRepository<KitchenTicket>;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        const policy = new KitchenPolicy();
        const uow = new UnitOfWorkFactory();
        useCase = new StartCourse(repo, policy, uow);
    });

    it('should start a course successfully', async () => {
        const item1 = KitchenItem.create('Wings', 1);
        const item2 = KitchenItem.create('Steak', 2);
        const ticket = KitchenTicket.create('tk-1', [item1, item2]);
        const ctx = ContextFactory.createSystem();
        await repo.save(ctx as any, ticket);

        await useCase.run({ ticketId: 'tk-1', course: 1 });

        const savedTicket = await repo.getById(ctx, 'tk-1');
        expect(savedTicket?._data.items[0]._data.status).toBe('COOKING');
        expect(savedTicket?._data.items[1]._data.status).toBe('RECEIVED');
    });

    it('should throw NotFoundError if ticket not found', async () => {
        await expect(useCase.run({ ticketId: 'non-existent', course: 1 })).rejects.toThrow(NotFoundError);
    });
});
