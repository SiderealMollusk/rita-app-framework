import { UnitOfWork } from '../ports/UnitOfWorkPort';
import { UnitOfWorkFactoryPort } from '../ports/UnitOfWorkFactoryPort';
import { CommandCtx } from '../context/CommandCtx';
import { CommitCap } from '../context/capabilities/CommitCap';
import { EventBusPort, DomainEvent } from '../ports/EventBusPort';
import { BaseCtx } from '../context/BaseCtx';

export interface TransactionalEntity {
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

class UnitOfWorkImpl implements UnitOfWork {

    private events: { ctx: BaseCtx, event: DomainEvent }[] = [];
    private participants: TransactionalEntity[] = [];

    constructor(
        private eventBus: EventBusPort | undefined,
        private onClose: () => void
    ) { }

    public registerEvent(ctx: BaseCtx, event: DomainEvent) {
        this.events.push({ ctx, event });
    }

    public registerParticipant(participant: TransactionalEntity) {
        this.participants.push(participant);
    }

    public async commit(): Promise<void> {
        // 1. Commit State
        for (const participant of this.participants) {
            await participant.commit();
        }

        // 2. Outbox "Simulated" (Publish after commit)
        const toPublish = [...this.events];
        this.events = [];
        this.participants = [];

        if (this.eventBus) {
            for (const { ctx, event } of toPublish) {
                // Remove UoW from context to force actual publication
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { uow, ...rest } = ctx as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await this.eventBus.publish(rest as any, event);
            }

        }
    }

    public async rollback(): Promise<void> {
        for (const participant of this.participants) {
            await participant.rollback();
        }
        this.events = [];
        this.participants = [];
    }

    public async close(): Promise<void> {
        this.events = [];
        this.participants = [];
        this.onClose();
    }
}

export class InMemoryUnitOfWorkFactory implements UnitOfWorkFactoryPort {
    // strict guard for nested transactions
    private activeTraces = new Set<string>();

    constructor(private eventBus?: EventBusPort) { }

    public async open(ctx: CommandCtx): Promise<UnitOfWork> {
        // 1. Capability Check
        ctx.capabilities.require(CommitCap);

        // 2. Nesting Check (Law 5)
        if (this.activeTraces.has(ctx.traceId)) {
            throw new Error(`Nested UnitOfWork detected for trace ${ctx.traceId}`);
        }

        this.activeTraces.add(ctx.traceId);

        return new UnitOfWorkImpl(this.eventBus, () => {
            this.activeTraces.delete(ctx.traceId);
        });
    }

    /**
     * @deprecated Use open()
     */
    public async start(ctx: CommandCtx): Promise<UnitOfWork> {
        return this.open(ctx);
    }
}


// Backward Compatibility Alias
export { InMemoryUnitOfWorkFactory as UnitOfWorkFactory };


