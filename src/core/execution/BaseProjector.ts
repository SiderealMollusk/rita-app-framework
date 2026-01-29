import { BaseComponent } from './BaseComponent';
import { BaseCtx } from '../context/BaseCtx';
import { DomainEvent } from '../ports/EventBusPort';

/**
 * A component that listens to domain events and projects them into a Read Model.
 */
export abstract class BaseProjector<TEvent extends DomainEvent> extends BaseComponent<TEvent, void> {
    /**
     * Projects the event.
     */
    protected abstract _run(ctx: BaseCtx, event: TEvent): Promise<void>;
}
