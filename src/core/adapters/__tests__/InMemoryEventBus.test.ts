import { InMemoryEventBus } from '../InMemoryEventBus';
import { ContextFactory } from '../../context/promotion/ContextFactory';
import { DomainEvent } from '../../ports/EventBusPort';
import { BaseCtx } from '../../context/BaseCtx';

describe('InMemoryEventBus', () => {
    let bus: InMemoryEventBus;
    let ctx: BaseCtx;

    beforeEach(() => {
        bus = new InMemoryEventBus();
        ctx = ContextFactory.createExternal();
    });

    it('should publish and subscribe to events', async () => {
        const handler = jest.fn();
        const event: DomainEvent = {
            name: 'TestEvent',
            timestamp: new Date(),
            payload: { foo: 'bar' }
        };

        bus.subscribe('TestEvent', handler);
        await bus.publish(ctx, event);

        expect(handler).toHaveBeenCalledWith(ctx, event);
    });

    it('should handle multiple subscribers', async () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const event: DomainEvent = {
            name: 'TestEvent',
            timestamp: new Date(),
            payload: {}
        };

        bus.subscribe('TestEvent', handler1);
        bus.subscribe('TestEvent', handler2);
        await bus.publish(ctx, event);

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('should handle events with no subscribers', async () => {
        const event: DomainEvent = {
            name: 'NoSubscriberEvent',
            timestamp: new Date(),
            payload: {}
        };

        await expect(bus.publish(ctx, event)).resolves.not.toThrow();
    });

    it('should record exception if handler fails', async () => {
        const error = new Error('Handler failed');
        const handler = jest.fn().mockRejectedValue(error);
        const event: DomainEvent = {
            name: 'FailEvent',
            timestamp: new Date(),
            payload: {}
        };

        bus.subscribe('FailEvent', handler);
        await expect(bus.publish(ctx, event)).rejects.toThrow('Handler failed');
    });
});
