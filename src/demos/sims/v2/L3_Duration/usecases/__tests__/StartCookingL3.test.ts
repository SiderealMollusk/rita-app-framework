import { StartCookingL3 } from '../StartCookingL3';
import { PlaceOrder } from '../../../L1_Atomic/usecases/PlaceOrder';
import { CompleteItem } from '../../../L1_Atomic/usecases/CompleteItem';
import { KitchenPolicy } from '../../../L1_Atomic/domain/KitchenPolicy';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { InMemoryRepository, UnitOfWorkFactory, SimulatedIdGenerator, SimulatedClock, ContextFactory } from '../../../../../../core';

describe('StartCookingL3', () => {
    let startCooking: StartCookingL3;
    let placeOrder: PlaceOrder;
    let repo: InMemoryRepository<KitchenTicket>;
    let clock: SimulatedClock;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        const idGen = new SimulatedIdGenerator();
        const eventBus = null as any; // Not used here
        const uow = new UnitOfWorkFactory();
        const policy = new KitchenPolicy();
        clock = new SimulatedClock();
        const completeItem = new CompleteItem(repo, policy, uow);
        startCooking = new StartCookingL3(repo, policy, uow, clock, completeItem);
        placeOrder = new PlaceOrder(repo, uow, idGen);
    });

    it('should schedule item completion', async () => {
        const ticketId = await placeOrder.run({ item: 'Steak' }, 'Waiter');
        await startCooking.run({ ticketId });

        const sysCtx = ContextFactory.createSystem();
        let ticket = await repo.getById(sysCtx, ticketId);
        expect(ticket?._data.status).toBe('COOKING');

        // Fast forward 10 mins
        await clock.advance(600000);
        ticket = await repo.getById(sysCtx, ticketId);
        expect(ticket?._data.status).toBe('COOKING'); // Still cooking

        // Fast forward another 10 mins
        await clock.advance(600000);
        ticket = await repo.getById(sysCtx, ticketId);
        expect(ticket?._data.status).toBe('COMPLETED');
    });

    it('should handle items without specific durations', async () => {
        const ticketId = await placeOrder.run({ item: 'Salad' }, 'Waiter');
        await startCooking.run({ ticketId });

        const sysCtx = ContextFactory.createSystem();
        // Default is 5 mins
        await clock.advance(300000);
        const ticket = await repo.getById(sysCtx, ticketId);
        expect(ticket?._data.status).toBe('COMPLETED');
    });

    it('should not schedule if clock does not support it', async () => {
        const repo2 = new InMemoryRepository<KitchenTicket>();
        const uow2 = new UnitOfWorkFactory();
        const policy2 = new KitchenPolicy();
        const clockWithoutSchedule = { now: () => new Date() };
        const completeItem2 = new CompleteItem(repo2, policy2, uow2);
        const startCooking2 = new StartCookingL3(repo2, policy2, uow2, clockWithoutSchedule as any, completeItem2);

        const idGen2 = new SimulatedIdGenerator();
        const placeOrder2 = new PlaceOrder(repo2, uow2, idGen2);
        const ticketId = await placeOrder2.run({ item: 'Burger' });

        await expect(startCooking2.run({ ticketId })).resolves.not.toThrow();
    });

    it('should throw if ticket not found', async () => {
        await expect(startCooking.run({ ticketId: 'missing-id' }))
            .rejects.toThrow('KitchenTicket with ID missing-id not found');
    });
});


