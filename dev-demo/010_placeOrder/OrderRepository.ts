import { BaseGateway } from '../../src/system/BaseGateway';
import { Order } from './Order';
import { RitaCtx } from '../../src/system/RitaCtx';

export class OrderRepository extends BaseGateway {
    public async save(ctx: RitaCtx, order: Order): Promise<void> {
        return this.safeExecute(ctx, 'saveOrder', async () => {
            // Simulate DB latency
            await new Promise(resolve => setTimeout(resolve, 10));
            // In real app: await db.insert(...)
        });
    }
}
