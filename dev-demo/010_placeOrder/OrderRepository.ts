import { BaseSecondaryAdapter } from '../../src/core/BaseSecondaryAdapter';
import { Order } from './Order';
import { SystemCtx } from '../../src/core/SystemCtx';

export class OrderRepository extends BaseSecondaryAdapter {
    public async save(ctx: SystemCtx, _order: Order): Promise<void> {
        return this.safeExecute(ctx, 'saveOrder', async () => {
            // Simulate DB latency
            await new Promise(resolve => setTimeout(resolve, 10));
            // In real app: await db.insert(...)
        });
    }

}
