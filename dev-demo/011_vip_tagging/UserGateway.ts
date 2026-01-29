import { BaseSecondaryAdapter } from '../../src/core/BaseSecondaryAdapter';
import { CustomerProfile } from './CustomerProfile';
import { SystemCtx } from '../../src/core/SystemCtx';

export class UserGateway extends BaseSecondaryAdapter {

    // STUB: Simulate a network call to a User Service
    public async getUser(ctx: SystemCtx, userId: string): Promise<CustomerProfile> {
        return this.safeExecute(ctx, 'getUser', async () => {
            // Simulate Latency
            await new Promise(r => setTimeout(r, 5));

            // Stub Logic
            if (userId === 'u_gold') return { userId, tier: 'GOLD' };
            if (userId === 'u_plat') return { userId, tier: 'PLAT' };

            // Default
            return { userId, tier: 'STD' };
        });
    }
}
