import { FinishItem } from '../FinishItem';
import { FinishItemPolicy } from '../../domain/FinishItemPolicy';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { KitchenItem } from '../../../L1_Atomic/domain/KitchenItem';
import { InMemoryRepository, UnitOfWorkFactory, ContextFactory, NotFoundError } from '../../../../../../core';

describe('FinishItem', () => {
    let useCase: FinishItem;
    let repo: InMemoryRepository<KitchenTicket>;
    let policy: FinishItemPolicy;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        policy = new FinishItemPolicy();
        const uow = new UnitOfWorkFactory();
        useCase = new FinishItem(repo, policy, uow);
    });

    it('should finish item successfully', async () => {
        const item = KitchenItem.create('Burger');
        const ticket = KitchenTicket.create('tk-1', [item]);
        const ctx = ContextFactory.createSystem();
        await repo.save(ctx as any, ticket);

        await useCase.run({ ticketId: 'tk-1', item: 'Burger' });

        const savedTicket = await repo.getById(ctx, 'tk-1');
        expect(savedTicket?._data.items[0]._data.status).toBe('READY');
    });

    it('should throw if ticket not found', async () => {
        await expect(useCase.run({ ticketId: 'tk-1', item: 'Burger' })).rejects.toThrow(NotFoundError);
    });
});
