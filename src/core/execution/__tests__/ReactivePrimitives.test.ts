import { BaseProjector } from '../BaseProjector';
import { BaseProcessManager } from '../BaseProcessManager';
import { BaseCtx } from '../../context/BaseCtx';
import { DomainEvent } from '../../ports/EventBusPort';
import { ContextFactory } from '../../context/promotion/ContextFactory';

class MockProjector extends BaseProjector<DomainEvent> {
    public runCalled = false;
    protected async _run(ctx: BaseCtx, event: DomainEvent): Promise<void> {
        this.runCalled = true;
    }
}

class MockProcessManager extends BaseProcessManager<DomainEvent> {
    public runCalled = false;
    protected async _run(ctx: BaseCtx, event: DomainEvent): Promise<void> {
        this.runCalled = true;
    }
}

describe('Projector and ProcessManager', () => {
    let ctx: BaseCtx;

    beforeEach(() => {
        ctx = ContextFactory.createExternal();
    });

    it('should execute projector', async () => {
        const projector = new MockProjector();
        const event: DomainEvent = { name: 'Test', timestamp: new Date(), payload: {} };
        await projector.execute(ctx, event);
        expect(projector.runCalled).toBe(true);
    });

    it('should execute process manager', async () => {
        const pm = new MockProcessManager();
        const event: DomainEvent = { name: 'Test', timestamp: new Date(), payload: {} };
        await pm.execute(ctx, event);
        expect(pm.runCalled).toBe(true);
    });
});
