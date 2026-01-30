import { CloseTicket } from '../CloseTicket';
import { TicketClosingPolicy } from '../../domain/TicketClosingPolicy';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { KitchenItem } from '../../../L1_Atomic/domain/KitchenItem';
import { InMemoryRepository, UnitOfWorkFactory, ContextFactory, BusinessRuleViolationError, NotFoundError } from '../../../../../../core';

describe('CloseTicket', () => {
    let useCase: CloseTicket;
    let repo: InMemoryRepository<KitchenTicket>;
    let policy: TicketClosingPolicy;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        policy = new TicketClosingPolicy();
        const uow = new UnitOfWorkFactory();
        useCase = new CloseTicket(repo, policy, uow);
    });

    it('should close ticket successfully', async () => {
        const token = (policy as any).token;
        const item = KitchenItem.create('Burger')._evolve({ status: 'READY' }, 'ready', token);
        const ticket = KitchenTicket.create('tk-1', [item]);
        const ctx = ContextFactory.createSystem();
        await repo.save(ctx as any, ticket);

        await useCase.run({ id: 'tk-1' });

        const savedTicket = await repo.getById(ctx, 'tk-1');
        expect(savedTicket?._data.status).toBe('CLOSED');
    });

    it('should throw if ticket not found', async () => {
        await expect(useCase.run({ id: 'tk-1' })).rejects.toThrow(NotFoundError);
    });
});
