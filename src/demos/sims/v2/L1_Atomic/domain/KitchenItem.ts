import { BaseValueObject, DomainValidationError } from '../../../../../core';

export type KitchenItemStatus = 'RECEIVED' | 'COOKING' | 'COMPLETED';

export interface KitchenItemData {
    name: string;
    status: KitchenItemStatus;
}

export class KitchenItem extends BaseValueObject<KitchenItemData> {
    protected validate(data: KitchenItemData): void {
        if (!data.name) throw new DomainValidationError('Item name is required');
        if (!['RECEIVED', 'COOKING', 'COMPLETED'].includes(data.status)) {
            throw new DomainValidationError(`Invalid status: ${data.status}`);
        }
    }

    static create(name: string): KitchenItem {
        return new KitchenItem({ name, status: 'RECEIVED' });
    }
}
