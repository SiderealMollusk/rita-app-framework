import { BaseEntity, DomainValidationError } from '../../../../../core';
import { KitchenItem, KitchenItemStatus } from './KitchenItem';

export interface KitchenTicketData {
    items: KitchenItem[];
    status: KitchenItemStatus;
}

export class KitchenTicket extends BaseEntity<KitchenTicketData> {
    protected validate(data: KitchenTicketData): void {
        if (!data.items) throw new DomainValidationError('Items are required');
        if (!['RECEIVED', 'COOKING', 'COMPLETED'].includes(data.status)) {
            throw new DomainValidationError(`Invalid status: ${data.status}`);
        }
    }

    static create(id: string, items: KitchenItem[]): KitchenTicket {
        return new KitchenTicket(id, {
            items,
            status: 'RECEIVED'
        });
    }
}
