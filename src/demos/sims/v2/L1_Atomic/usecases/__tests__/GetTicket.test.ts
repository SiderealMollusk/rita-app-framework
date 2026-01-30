import { GetTicket } from '../GetTicket';
import { PlaceOrder } from '../PlaceOrder';
import { KitchenTicket } from '../../domain/KitchenTicket';
import { InMemoryRepository, UnitOfWorkFactory, SimulatedIdGenerator, NotFoundError } from '../../../../../../core';

describe('GetTicket', () => {
    let getTicket: GetTicket;
    let placeOrder: PlaceOrder;
    let repo: InMemoryRepository<KitchenTicket>;
    let idGen: SimulatedIdGenerator;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        idGen = new SimulatedIdGenerator();
        const uow = new UnitOfWorkFactory();
        getTicket = new GetTicket(repo);
        placeOrder = new PlaceOrder(repo, uow, idGen);
    });

    it('should get ticket successfully', async () => {
        const ticketId = await placeOrder.run({ item: 'Burger' }, 'Waiter');
        const ticket = await getTicket.run({ ticketId });
        expect(ticket.status).toBe('RECEIVED');
        expect(ticket.items[0].name).toBe('Burger');
    });

    it('should throw NotFoundError if ticket does not exist', async () => {
        await expect(getTicket.run({ ticketId: 'non-existent' })).rejects.toThrow(NotFoundError);
    });
});
