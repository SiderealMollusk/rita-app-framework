import { BaseComponent } from '../../src/system/BaseComponent';
import { Order } from './Order';
import { UserGateway } from './UserGateway';
import { OrderRepository } from './OrderRepository';
import { PriorityPolicy } from './PriorityPolicy';
import { RitaCtx } from '../../src/system/RitaCtx';

type Input = {
    orderId: string;
    userId: string;
    amount: number;
};

export class TagOrder extends BaseComponent<Input, Order> {

    constructor(
        private readonly userGateway: UserGateway,
        private readonly orderRepo: OrderRepository,
        private readonly policy: PriorityPolicy = new PriorityPolicy()
    ) {
        super();
    }

    protected async _run(ctx: RitaCtx, input: Input): Promise<Order> {
        // 1. Create Initial Order (Clean)
        let order = new Order({
            id: input.orderId,
            amount: input.amount,
            priority: 'NORMAL' // Correct initial state
        });

        // 2. Fetch Context (Async Side Effect)
        const userProfile = await this.userGateway.getUser(ctx, input.userId);

        // 3. Apply Logic (Pure)
        order = this.policy.execute(ctx, order, userProfile);

        // 4. Save (Side Effect)
        await this.orderRepo.save(ctx, order);

        return order;
    }
}
