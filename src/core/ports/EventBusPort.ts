import { BaseCtx } from '../context/BaseCtx';

export interface DomainEvent {
    readonly name: string;
    readonly timestamp: Date;
    readonly payload: any;
}

export type EventHandler = (ctx: BaseCtx, event: DomainEvent) => Promise<void>;

/**
 * Port for dispatching and subscribing to domain events.
 */
export interface EventBusPort {
    /**
     * Publishes an event to the bus.
     */
    publish(ctx: BaseCtx, event: DomainEvent): Promise<void>;

    /**
     * Subscribes a handler to a specific event name.
     */
    subscribe(eventName: string, handler: EventHandler): void;
}
