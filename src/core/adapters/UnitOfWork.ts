import { UnitOfWork, UnitOfWorkPort } from '../ports/UnitOfWorkPort';
import { CommandCtx } from '../context/CommandCtx';
import { CommitCap } from '../context/capabilities/CommitCap';
import { EventBusPort, DomainEvent } from '../ports/EventBusPort';
import { BaseCtx } from '../context/BaseCtx';

export interface TransactionalEntity {
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

export class UnitOfWorkImpl implements UnitOfWork {
    private events: { ctx: BaseCtx, event: DomainEvent }[] = [];
    private participants: TransactionalEntity[] = [];

    constructor(private eventBus?: EventBusPort) {}

    public registerEvent(ctx: BaseCtx, event: DomainEvent) {
        this.events.push({ ctx, event });
    }

    public registerParticipant(participant: TransactionalEntity) {
        this.participants.push(participant);
    }

    public async commit(): Promise<void> {
        for (const participant of this.participants) {
            await participant.commit();
        }

        const toPublish = [...this.events];
        this.events = [];
        this.participants = [];

        if (this.eventBus) {
            for (const { ctx, event } of toPublish) {
                // Remove UoW from context to force actual publication
                const { uow, ...rest } = ctx as any;
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
    }
}

export class UnitOfWorkFactory implements UnitOfWorkPort {
    constructor(private eventBus?: EventBusPort) {}

    public async start(ctx: CommandCtx): Promise<UnitOfWork> {
        ctx.capabilities.require(CommitCap);
        return new UnitOfWorkImpl(this.eventBus);
    }
}
