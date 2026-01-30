import { BaseValueObject, DomainValidationError } from '../../../../../core';

export type KitchenItemStatus = 'RECEIVED' | 'COOKING' | 'COMPLETED' | 'READY';

export interface KitchenItemData {
    name: string;
    status: KitchenItemStatus;
    course: number;
}

export class KitchenItem extends BaseValueObject<KitchenItemData> {
    protected validate(data: KitchenItemData): void {
        if (!data.name) throw new DomainValidationError('Item name is required');
        if (!['RECEIVED', 'COOKING', 'COMPLETED', 'READY'].includes(data.status)) {
            throw new DomainValidationError(`Invalid status: ${data.status}`);
        }
    }

    static create(name: string, course: number = 1): KitchenItem {
        return new KitchenItem({ name, status: 'RECEIVED', course });
    }
}
