import { DecisionPolicy, Evolution } from '../../src/system/DecisionPolicy';
import { Order } from './Order';

// Note: DecisionPolicy.execute signature changed in base class, 
// no change needed here in spec(), but consumer must call execute(ctx, ...)

export class PlaceOrderPolicy extends DecisionPolicy<Order> {
    protected decide(target: Order): Evolution<Order>[] {
        if (target.amount > 1000) {
            return [{
                changes: { status: 'VIP' },
                note: "Order > 1000 is VIP"
            }];
        }
        return [];
    }
}
