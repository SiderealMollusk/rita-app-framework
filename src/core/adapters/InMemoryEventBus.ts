import { BaseCtx } from '../context/BaseCtx';
import { EventBusPort, DomainEvent, EventHandler } from '../ports/EventBusPort';
import { Logger } from '../telemetry/Logger';
import { Tracer } from '../telemetry/Tracer';

/**
 * Synchronous in-memory implementation of the EventBus.
 * Designed for deterministic execution in simulations.
 */
export class InMemoryEventBus implements EventBusPort {
    private handlers = new Map<string, EventHandler[]>();

    public async publish(ctx: BaseCtx, event: DomainEvent): Promise<void> {
        const span = Tracer.startSpan(`[EventBus] Publish ${event.name}`, ctx);

        try {
            Logger.info(`[EventBus] Publishing event: ${event.name}`, {
                traceId: ctx.traceId,
                payload: event.payload
            });

            const eventHandlers = this.handlers.get(event.name) || [];

            // Execute handlers sequentially for determinism
            for (const handler of eventHandlers) {
                await handler(ctx, event);
            }

            span.end();
        } catch (err: any) {
            Logger.error(`[EventBus] Failed to publish event: ${event.name}`, {
                traceId: ctx.traceId,
                error: err.message
            });
            span.recordException(err);
            span.end();
            throw err;
        }
    }

    public subscribe(eventName: string, handler: EventHandler): void {
        const eventHandlers = this.handlers.get(eventName) || [];
        eventHandlers.push(handler);
        this.handlers.set(eventName, eventHandlers);
    }
}
