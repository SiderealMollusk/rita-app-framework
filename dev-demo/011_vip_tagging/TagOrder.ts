import { BaseCommand } from '../../src/system/cqrs/BaseCommand';
import { Order } from './Order';
import { UserGateway } from './UserGateway';
import { OrderRepository } from './OrderRepository';
import { PriorityPolicy } from './PriorityPolicy';
import { SystemCtx } from '../../src/system/SystemCtx';

type Input = {
    orderId: string;
    userId: string;
    amount: number;
};

export class TagOrder extends BaseCommand<Input, Order> {

    constructor(
        private readonly userGateway: UserGateway,
        private readonly orderRepo: OrderRepository,
        private readonly policy: PriorityPolicy = new PriorityPolicy()
    ) {
        super();
    }

    protected async _run(ctx: SystemCtx, input: Input): Promise<Order> {
        // 1. Create Initial Order (Clean)
        let order = new Order({
            id: input.orderId,
            amount: input.amount,
            priority: 'NORMAL' // Correct initial state
        });

        // 2. Fetch Context (Async Side Effect)
        const userProfile = await this.userGateway.getUser(ctx, input.userId);

        // 3. Apply Logic (Pure)
        // Policy execution remains pure (returns evolutions/mutated object)
        order = this.policy.execute(ctx, order, userProfile);

        // 4. Save (Side Effect) - NOW REQUIRES COMMIT SCOPE
        await this.commit(ctx, async (scope) => {
            await this.orderRepo.saveIfChanged(scope, undefined, order);
        });

        return order;
    }
}

