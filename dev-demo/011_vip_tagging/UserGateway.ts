import { BaseGateway } from '../../src/system/BaseGateway';
import { CustomerProfile } from './CustomerProfile';
import { RitaCtx } from '../../src/system/RitaCtx';

export class UserGateway extends BaseGateway {

    // STUB: Simulate a network call to a User Service
    public async getUser(ctx: RitaCtx, userId: string): Promise<CustomerProfile> {
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
