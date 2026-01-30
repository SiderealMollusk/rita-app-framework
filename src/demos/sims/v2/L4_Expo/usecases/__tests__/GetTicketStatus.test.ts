import { GetTicketStatus } from '../GetTicketStatus';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { InMemoryRepository, ContextFactory, NotFoundError } from '../../../../../../core';

describe('GetTicketStatus', () => {
    let useCase: GetTicketStatus;
    let repo: InMemoryRepository<KitchenTicket>;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        useCase = new GetTicketStatus(repo);
    });

    it('should return ticket status', async () => {
        const ticket = KitchenTicket.create('tk-1', []);
        const ctx = ContextFactory.createSystem();
        await repo.save(ctx as any, ticket);

        const status = await useCase.run({ id: 'tk-1' });
        expect(status).toBe('RECEIVED');
    });

    it('should throw if ticket not found', async () => {
        await expect(useCase.run({ id: 'tk-1' })).rejects.toThrow(NotFoundError);
    });
});
