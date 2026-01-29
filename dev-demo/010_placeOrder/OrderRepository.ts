import { BaseGateway } from '../../src/system/BaseGateway';
import { Order } from './Order';
import { SystemCtx } from '../../src/system/SystemCtx';

export class OrderRepository extends BaseGateway {
    public async save(ctx: SystemCtx, _order: Order): Promise<void> {
        return this.safeExecute(ctx, 'saveOrder', async () => {
            // Simulate DB latency
            await new Promise(resolve => setTimeout(resolve, 10));
            // In real app: await db.insert(...)
        });
    }

}
