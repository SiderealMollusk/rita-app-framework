import { BaseGateway } from '../../src/system/BaseGateway';
import { Order } from './Order';
import { RitaCtx } from '../../src/system/RitaCtx';

export class OrderRepository extends BaseGateway {
    // In-Memory Log
    public readonly savedOrders: Order[] = [];

    public async save(ctx: RitaCtx, order: Order): Promise<void> {
        return this.safeExecute(ctx, 'saveOrder', async () => {
            this.savedOrders.push(order);
        });
    }
}
