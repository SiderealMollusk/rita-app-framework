import { CompleteItem } from '../CompleteItem';
import { StartCooking } from '../StartCooking';
import { PlaceOrder } from '../PlaceOrder';
import { KitchenPolicy } from '../../domain/KitchenPolicy';
import { KitchenTicket } from '../../domain/KitchenTicket';
import { InMemoryRepository, UnitOfWorkFactory, SimulatedIdGenerator, ContextFactory, NotFoundError } from '../../../../../../core';

describe('CompleteItem', () => {
    let completeItem: CompleteItem;
    let startCooking: StartCooking;
    let placeOrder: PlaceOrder;
    let repo: InMemoryRepository<KitchenTicket>;
    let idGen: SimulatedIdGenerator;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        idGen = new SimulatedIdGenerator();
        const uow = new UnitOfWorkFactory();
        const policy = new KitchenPolicy();
        completeItem = new CompleteItem(repo, policy, uow);
        startCooking = new StartCooking(repo, policy, uow);
        placeOrder = new PlaceOrder(repo, uow, idGen);
    });

    it('should complete item successfully', async () => {
        const ticketId = await placeOrder.run({ item: 'Burger' }, 'Waiter');
        await startCooking.run({ ticketId });
        await completeItem.run({ ticketId, itemName: 'Burger' });

        const sysCtx = ContextFactory.createSystem();
        const ticket = await repo.getById(sysCtx, ticketId);
        expect(ticket?._data.status).toBe('COMPLETED');
        expect(ticket?._data.items[0]._data.status).toBe('COMPLETED');
    });

    it('should throw NotFoundError if ticket does not exist', async () => {
        await expect(completeItem.run({ ticketId: 'non-existent', itemName: 'Burger' })).rejects.toThrow(NotFoundError);
    });
});
