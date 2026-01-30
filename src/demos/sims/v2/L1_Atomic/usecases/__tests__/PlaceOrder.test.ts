import { PlaceOrder } from '../PlaceOrder';
import { PlaceOrderComponent } from '../PlaceOrderComponent';
import { KitchenTicket } from '../../domain/KitchenTicket';
import { InMemoryRepository, UnitOfWorkFactory, SimulatedIdGenerator, ContextFactory } from '../../../../../../core';

describe('PlaceOrder', () => {
    let useCase: PlaceOrder;
    let repo: InMemoryRepository<KitchenTicket>;
    let idGen: SimulatedIdGenerator;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        idGen = new SimulatedIdGenerator();
        const uow = new UnitOfWorkFactory();
        useCase = new PlaceOrder(repo, uow, idGen);
    });

    it('should place an order successfully', async () => {
        const ticketId = await useCase.run({ item: 'Burger' }, 'Waiter');
        expect(ticketId).toBe('ticket-1');

        const sysCtx = ContextFactory.createSystem();
        const ticket = await repo.getById(sysCtx, ticketId);
        expect(ticket).toBeDefined();
        expect(ticket?._data.status).toBe('RECEIVED');
        expect(ticket?._data.items[0]._data.name).toBe('Burger');
    });
});
