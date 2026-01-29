import { BaseEntity } from '../../src/core/BaseEntity';

export type OrderProps = {
    id: string;
    amount: number;
    priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
};

export class Order extends BaseEntity<OrderProps> {
    protected validate(data: OrderProps) {
        if (data.amount < 0) throw new Error("Amount cannot be negative");
    }

    public get amount() { return this._data.amount; }
    public get priority() { return this._data.priority; }
}
