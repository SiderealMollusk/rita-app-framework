import { BaseEntity, DomainValidationError } from '../../../../../core';

export interface StationItemData {
    ticketId: string;
    itemName: string;
    station: string;
}

export class StationItem extends BaseEntity<StationItemData> {
    protected validate(data: StationItemData): void {
        if (!data.ticketId) throw new DomainValidationError('TicketId is required');
        if (!data.itemName) throw new DomainValidationError('ItemName is required');
        if (!data.station) throw new DomainValidationError('Station is required');
    }

    static create(id: string, ticketId: string, itemName: string, station: string): StationItem {
        return new StationItem(id, { ticketId, itemName, station });
    }
}
