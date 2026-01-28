import { BaseEntity } from '../../src/system/BaseEntity';

export type OrderProps = {
    id: string;
    amount: number;
    customerId: string;
    status: 'PENDING' | 'VIP' | 'REJECTED';
};

export class Order extends BaseEntity<OrderProps> {
    protected validate(data: OrderProps) {
        if (!data.customerId) throw new Error("Order must have a customerId");
    }

    public get amount() { return this._data.amount; }
    public get status() { return this._data.status; }
}
