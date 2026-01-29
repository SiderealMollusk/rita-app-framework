import { BaseComponent, CommandCtx, NotFoundError, InternalCtx } from '../../../../../core';
import { KitchenPolicy } from '../domain/KitchenPolicy';

export interface StartCookingInput {
    ticketId: string;
}

export class StartCookingComponent extends BaseComponent<StartCookingInput, void> {
    constructor(private repo: any, private policy: KitchenPolicy) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: StartCookingInput): Promise<void> {
        const ticket = await this.repo.getById(ctx, input.ticketId);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.ticketId);

        const evolvedTicket = this.policy.execute(ctx as unknown as InternalCtx, ticket, { kind: 'START_COOKING' });
        await this.repo.save(ctx, evolvedTicket);
    }
}
