import { BaseComponent } from './BaseComponent';
import { BaseCtx } from '../context/BaseCtx';
import { DomainEvent } from '../ports/EventBusPort';

/**
 * A component that coordinates long-running processes (Sagas).
 * It listens to events and may trigger new commands.
 */
export abstract class BaseProcessManager<TEvent extends DomainEvent> extends BaseComponent<TEvent, void> {
    /**
     * Handles the event and coordinates the next steps.
     */
    protected abstract _run(ctx: BaseCtx, event: TEvent): Promise<void>;
}
