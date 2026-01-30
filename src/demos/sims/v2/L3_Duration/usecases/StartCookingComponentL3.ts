import { BaseComponent, CommandCtx, NotFoundError, InternalCtx, ClockPort } from '../../../../../core';
import { KitchenPolicy } from '../../L1_Atomic/domain/KitchenPolicy';
import { CompleteItem } from '../../L1_Atomic/usecases/CompleteItem';

export interface StartCookingInputL3 {
    ticketId: string;
}

export class StartCookingComponentL3 extends BaseComponent<StartCookingInputL3, void> {
    constructor(
        private repo: any,
        private policy: KitchenPolicy,
        private clock: ClockPort,
        private completeItemUseCase: CompleteItem
    ) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: StartCookingInputL3): Promise<void> {
        const ticket = await this.repo.getById(ctx, input.ticketId);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.ticketId);

        const evolvedTicket = this.policy.execute(ctx as unknown as InternalCtx, ticket, { kind: 'START_COOKING' });
        await this.repo.save(ctx, evolvedTicket);

        // Schedule completion for each item
        for (const item of evolvedTicket._data.items) {
            const delay = this.getCookingDuration(item._data.name);
            if (this.clock.schedule) {
                this.clock.schedule(async () => {
                    await this.completeItemUseCase.run({
                        ticketId: input.ticketId,
                        itemName: item._data.name
                    }, 'System:Clock');
                }, delay);
            }
        }
    }

    private getCookingDuration(itemName: string): number {
        if (itemName.toLowerCase().includes('steak')) return 20 * 60 * 1000; // 20 mins
        if (itemName.toLowerCase().includes('burger')) return 10 * 60 * 1000; // 10 mins
        return 5 * 60 * 1000; // 5 mins default
    }
}
