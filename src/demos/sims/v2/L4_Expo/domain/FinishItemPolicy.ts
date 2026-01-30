import { DecisionPolicy, Evolution } from '../../../../../core';
import { KitchenTicket } from '../../L1_Atomic/domain/KitchenTicket';

export type FinishItemAction = { kind: 'FINISH_ITEM', itemName: string };

export class FinishItemPolicy extends DecisionPolicy<KitchenTicket, FinishItemAction> {
    protected decide(target: KitchenTicket, action: FinishItemAction): Evolution<KitchenTicket>[] {
        if (action.kind !== 'FINISH_ITEM') return [];

        const newItems = target._data.items.map(item => {
            if (item._data.name === action.itemName) {
                return item._evolve({ status: 'READY' }, 'Item Finished', this.token);
            }
            return item;
        });

        return [{
            changes: {
                items: newItems,
                status: 'OPEN' // Ensure it stays OPEN
            },
            note: `Finished item: ${action.itemName}`
        }];
    }
}
