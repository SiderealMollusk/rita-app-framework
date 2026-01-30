import { BaseProjector, BaseCtx, CommandCtx, ContextFactory, IdGeneratorPort } from '../../../../../core';
import { TicketCreatedEvent } from '../domain/events';
import { StationItem } from '../domain/StationItem';

export class KitchenStationProjector extends BaseProjector<TicketCreatedEvent> {
    constructor(
        private stations: Map<string, any>,
        private idGen: IdGeneratorPort
    ) {
        super();
    }

    protected async _run(ctx: BaseCtx, event: TicketCreatedEvent): Promise<void> {
        // Projectors run in System context to have full write authority to read models
        const systemCtx = ContextFactory.promoteToSystem(ctx as any);

        for (const itemName of event.payload.items) {
            const station = this.route(itemName);
            const repo = this.stations.get(station);
            if (repo) {
                const id = this.idGen.generate(`si-${station}`);
                const stationItem = StationItem.create(id, event.payload.ticketId, itemName, station);
                await repo.save(systemCtx as any, stationItem);
            }
        }
    }

    private route(itemName: string): string {
        if (itemName.toLowerCase().includes('burger')) return 'Grill';
        if (itemName.toLowerCase().includes('fries')) return 'Fryer';
        if (itemName.toLowerCase().includes('coke')) return 'Bar';
        return 'Other';
    }
}
