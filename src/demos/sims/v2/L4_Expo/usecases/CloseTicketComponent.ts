import { BaseComponent, CommandCtx, NotFoundError, InternalCtx } from '../../../../../core';
import { TicketClosingPolicy } from '../domain/TicketClosingPolicy';

export interface CloseTicketInput {
    id: string;
}

export class CloseTicketComponent extends BaseComponent<CloseTicketInput, void> {
    constructor(private repo: any, private policy: TicketClosingPolicy) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: CloseTicketInput): Promise<void> {
        const ticket = await this.repo.getById(ctx, input.id);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.id);

        try {
            const evolvedTicket = this.policy.execute(ctx as unknown as InternalCtx, ticket, { kind: 'CLOSE_TICKET' });
            await this.repo.save(ctx, evolvedTicket);
        } catch (err) {
            // Re-throw to be handled by CommandUseCase (which handles rollback and logging)
            throw err;
        }
    }
}
