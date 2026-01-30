import { KitchenWorkflowManager } from '../KitchenWorkflowManager';
import { StartCourse } from '../StartCourse';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { KitchenItem } from '../../../L1_Atomic/domain/KitchenItem';
import { InMemoryRepository, ContextFactory, RitaClock, PolicyToken } from '../../../../../../core';

describe('KitchenWorkflowManager', () => {
    let workflow: KitchenWorkflowManager;
    let repo: InMemoryRepository<KitchenTicket>;
    let startCourse: StartCourse;

    beforeEach(() => {
        repo = new InMemoryRepository<KitchenTicket>();
        startCourse = {
            run: jest.fn().mockResolvedValue(undefined)
        } as any;
        workflow = new KitchenWorkflowManager(repo, startCourse);
    });

    // Re-doing the test more simply
    it('should start course 2 if course 1 is done', async () => {
        const item1 = KitchenItem.create('Wings', 1);
        const item2 = KitchenItem.create('Steak', 2);

        // Using a "cheat" to evolve without proper token in test if needed,
        // but better to use a real policy or create instances directly.
        const item1Done = new (KitchenItem as any)({ ...item1._data, status: 'COMPLETED' });
        const ticket = new (KitchenTicket as any)('tk-1', { items: [item1Done, item2], status: 'COOKING' });

        const ctx = ContextFactory.createSystem();
        await repo.save(ctx as any, ticket);

        await workflow.execute(ctx, {
            name: 'ItemCompleted',
            timestamp: new Date(),
            payload: { ticketId: 'tk-1', itemName: 'Wings' }
        });

        expect(startCourse.run).toHaveBeenCalledWith({ ticketId: 'tk-1', course: 2 }, 'System:Workflow');
    });

    it('should NOT start course 2 if course 1 is NOT all done', async () => {
        const item1 = KitchenItem.create('Wings', 1);
        const item2 = KitchenItem.create('Steak', 2);
        const ticket = KitchenTicket.create('tk-1', [item1, item2]);

        const ctx = ContextFactory.createSystem();
        await repo.save(ctx as any, ticket);

        await workflow.execute(ctx, {
            name: 'ItemCompleted',
            timestamp: new Date(),
            payload: { ticketId: 'tk-1', itemName: 'Something' }
        });

        expect(startCourse.run).not.toHaveBeenCalled();
    });

    it('should ignore other events', async () => {
        const ctx = ContextFactory.createSystem();
        await workflow.execute(ctx, {
            name: 'OtherEvent',
            timestamp: new Date(),
            payload: {}
        });
        expect(startCourse.run).not.toHaveBeenCalled();
    });

    it('should do nothing if ticket not found', async () => {
        const ctx = ContextFactory.createSystem();
        await workflow.execute(ctx, {
            name: 'ItemCompleted',
            timestamp: new Date(),
            payload: { ticketId: 'non-existent' }
        });
        expect(startCourse.run).not.toHaveBeenCalled();
    });
});
