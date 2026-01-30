import { PlaceOrderL2 } from '../PlaceOrderL2';
import { InMemoryRepository, UnitOfWorkFactory, SimulatedIdGenerator, InMemoryEventBus, ContextFactory } from '../../../../../../core';

describe('PlaceOrderL2', () => {
    let useCase: PlaceOrderL2;
    let repo: InMemoryRepository<any>;
    let idGen: SimulatedIdGenerator;
    let eventBus: InMemoryEventBus;

    beforeEach(() => {
        repo = new InMemoryRepository();
        idGen = new SimulatedIdGenerator();
        eventBus = new InMemoryEventBus();
        const uow = new UnitOfWorkFactory(eventBus);
        useCase = new PlaceOrderL2(repo, uow, idGen, eventBus);
    });

    it('should place an order and publish TicketCreated event', async () => {
        const events: any[] = [];
        eventBus.subscribe('TicketCreated', async (ctx, event) => {
            events.push(event);
        });

        const ticketId = await useCase.run({ items: ['Burger', 'Fries'] }, 'Waiter');
        expect(ticketId).toBe('ticket-1');

        expect(events).toHaveLength(1);
        expect(events[0].payload.ticketId).toBe('ticket-1');
        expect(events[0].payload.items).toEqual(['Burger', 'Fries']);
    });
});
