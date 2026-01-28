import { DecisionPolicy, Evolution } from '../../src/system/DecisionPolicy';
import { Order } from './Order';
import { CustomerProfile } from './CustomerProfile';

/**
 * Context-Aware Logic.
 * Decides: Order Priority.
 * Inputs: Order (Target), CustomerProfile (Context).
 */
export class PriorityPolicy extends DecisionPolicy<Order, CustomerProfile> {

    protected decide(order: Order, profile: CustomerProfile): Evolution<Order>[] {
        const evolutions: Evolution<Order>[] = [];

        // Rule 1: Gold/Plat Users -> HIGH Priority
        if (['GOLD', 'PLAT'].includes(profile.tier)) {
            evolutions.push({
                changes: { priority: 'HIGH' },
                note: `User is ${profile.tier} Tier`
            });
        }

        // Rule 2: High Value -> CRITICAL Priority
        if (order.amount > 1000) {
            evolutions.push({
                changes: { priority: 'CRITICAL' },
                note: "Order Value > 1000"
            });
        }

        return evolutions;
    }
}
