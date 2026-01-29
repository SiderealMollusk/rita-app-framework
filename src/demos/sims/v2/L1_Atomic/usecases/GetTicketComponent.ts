import { BaseComponent, InternalCtx, NotFoundError } from '../../../../../core';

export interface GetTicketInput {
    ticketId: string;
}

export class GetTicketComponent extends BaseComponent<GetTicketInput, any> {
    constructor(private repo: any) {
        super();
    }

    protected async _run(ctx: InternalCtx, input: GetTicketInput): Promise<any> {
        const ticket = await this.repo.getById(ctx, input.ticketId);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.ticketId);

        return {
            status: ticket._data.status,
            items: ticket._data.items.map((i: any) => ({
                name: i._data.name,
                status: i._data.status
            }))
        };
    }
}
