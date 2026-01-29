import { BaseComponent, CommandCtx } from '../../../../../core';
import { KitchenTicket } from '../domain/KitchenTicket';
import { KitchenItem } from '../domain/KitchenItem';

export interface PlaceOrderInput {
    item: string;
}

export class PlaceOrderComponent extends BaseComponent<PlaceOrderInput, string> {
    constructor(private repo: any) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: PlaceOrderInput): Promise<string> {
        const item = KitchenItem.create(input.item);
        const ticketId = 'ticket-1';
        const ticket = KitchenTicket.create(ticketId, [item]);
        await this.repo.save(ctx, ticket);
        return ticket.id;
    }
}
