import { StartCooking } from '../StartCooking';
import { PlaceOrder } from '../PlaceOrder';
import { KitchenPolicy } from '../../domain/KitchenPolicy';
import { KitchenTicket } from '../../domain/KitchenTicket';
import { InMemoryRepository, UnitOfWorkFactory, SimulatedIdGenerator, ContextFactory, NotFoundError } from '../../../../../../core';

describe('StartCooking', () => {
    let startCooking: StartCooking;
    let placeOrder: PlaceOrder;
    let repo: InMemoryRepository<KitchenTicket>;
    let idGen: SimulatedIdGenerator;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        idGen = new SimulatedIdGenerator();
        const uow = new UnitOfWorkFactory();
        const policy = new KitchenPolicy();
        startCooking = new StartCooking(repo, policy, uow);
        placeOrder = new PlaceOrder(repo, uow, idGen);
    });

    it('should start cooking successfully', async () => {
        const ticketId = await placeOrder.run({ item: 'Burger' }, 'Waiter');
        await startCooking.run({ ticketId });

        const sysCtx = ContextFactory.createSystem();
        const ticket = await repo.getById(sysCtx, ticketId);
        expect(ticket?._data.status).toBe('COOKING');
    });

    it('should throw NotFoundError if ticket does not exist', async () => {
        await expect(startCooking.run({ ticketId: 'non-existent' })).rejects.toThrow(NotFoundError);
    });
});
