import { BaseComponent, CommandCtx, NotFoundError, InternalCtx, EventBusPort, RitaClock } from '../../../../../core';
import { KitchenPolicy } from '../domain/KitchenPolicy';

export interface CompleteItemInput {
    ticketId: string;
    itemName: string;
}

export class CompleteItemComponent extends BaseComponent<CompleteItemInput, void> {
    constructor(
        private repo: any,
        private policy: KitchenPolicy,
        private eventBus?: EventBusPort
    ) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: CompleteItemInput): Promise<void> {
        const ticket = await this.repo.getById(ctx, input.ticketId);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.ticketId);

        const evolvedTicket = this.policy.execute(ctx as unknown as InternalCtx, ticket, {
            kind: 'COMPLETE_ITEM',
            itemName: input.itemName
        });
        await this.repo.save(ctx, evolvedTicket);

        if (this.eventBus) {
            await this.eventBus.publish(ctx, {
                name: 'ItemCompleted',
                timestamp: RitaClock.now(),
                payload: {
                    ticketId: input.ticketId,
                    itemName: input.itemName
                }
            });
        }
    }
}
