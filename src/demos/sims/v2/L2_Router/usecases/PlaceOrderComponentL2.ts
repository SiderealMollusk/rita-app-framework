import { BaseComponent, CommandCtx, IdGeneratorPort, EventBusPort, RitaClock } from '../../../../../core';
import { KitchenTicket } from '../../L1_Atomic/domain/KitchenTicket';
import { KitchenItem } from '../../L1_Atomic/domain/KitchenItem';

export interface PlaceOrderInputL2 {
    items: (string | { name: string, course: number })[];
}

export class PlaceOrderComponentL2 extends BaseComponent<PlaceOrderInputL2, string> {
    constructor(
        private repo: any,
        private idGen: IdGeneratorPort,
        private eventBus: EventBusPort
    ) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: PlaceOrderInputL2): Promise<string> {
        const items = input.items.map(item => {
            if (typeof item === 'string') return KitchenItem.create(item);
            return KitchenItem.create(item.name, item.course);
        });
        const ticketId = this.idGen.generate('ticket');
        const ticket = KitchenTicket.create(ticketId, items);

        await this.repo.save(ctx, ticket);

        await this.eventBus.publish(ctx, {
            name: 'TicketCreated',
            timestamp: RitaClock.now(),
            payload: {
                ticketId,
                items: items.map(it => it._data.name)
            }
        });

        return ticket.id;
    }
}
