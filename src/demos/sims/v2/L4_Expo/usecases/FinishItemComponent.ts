import { BaseComponent, CommandCtx, NotFoundError, InternalCtx } from '../../../../../core';
import { FinishItemPolicy } from '../domain/FinishItemPolicy';

export interface FinishItemInput {
    ticketId: string;
    item: string;
}

export class FinishItemComponent extends BaseComponent<FinishItemInput, void> {
    constructor(private repo: any, private policy: FinishItemPolicy) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: FinishItemInput): Promise<void> {
        const ticket = await this.repo.getById(ctx, input.ticketId);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.ticketId);

        const evolvedTicket = this.policy.execute(ctx as unknown as InternalCtx, ticket, {
            kind: 'FINISH_ITEM',
            itemName: input.item
        });
        await this.repo.save(ctx, evolvedTicket);
    }
}
