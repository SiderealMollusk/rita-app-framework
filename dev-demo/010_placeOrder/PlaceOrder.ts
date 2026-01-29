import { BaseComponent } from '../../src/system/BaseComponent';
import { Order } from './Order';
import { PlaceOrderPolicy } from './PlaceOrderPolicy';
import { OrderRepository } from './OrderRepository';
import { SystemCtx } from '../../src/system/SystemCtx';

export type PlaceOrderInput = {
    id: string;
    amount: number;
    customerId: string;
};


export class PlaceOrder extends BaseComponent<PlaceOrderInput, Order> {
    constructor(
        private readonly repo: OrderRepository,
        private readonly policy: PlaceOrderPolicy = new PlaceOrderPolicy()
    ) {
        super();
    }

    protected async _run(ctx: SystemCtx, input: PlaceOrderInput): Promise<Order> {
        // 1. Rehydrate / Factory
        if (input.amount < 0) throw new Error("Amount must be positive");

        let order = new Order({
            id: input.id,
            amount: input.amount,
            customerId: input.customerId,
            status: 'PENDING'
        });

        // 2. Apply Policy (Domain Logic)
        order = this.policy.execute(ctx, order);

        // 3. Persist (Side Effect via Gateway)
        await this.repo.save(ctx, order);

        return order;
    }
}
