import { DecisionPolicy, Evolution, BusinessRuleViolationError } from '../../../../../core';
import { KitchenTicket } from './KitchenTicket';
import { KitchenItem } from './KitchenItem';

export type KitchenAction =
    | { kind: 'START_COOKING' }
    | { kind: 'COMPLETE_ITEM', itemName: string };

export class KitchenPolicy extends DecisionPolicy<KitchenTicket, KitchenAction> {
    protected decide(target: KitchenTicket, action: KitchenAction): Evolution<KitchenTicket>[] {
        const { status, items } = target._data;

        switch (action.kind) {
            case 'START_COOKING':
                if (status !== 'RECEIVED') {
                    throw new BusinessRuleViolationError(`Cannot start cooking from status: ${status}`);
                }

                const startedItems = items.map(item =>
                    item._evolve({ status: 'COOKING' }, 'Started Cooking', this.token)
                );

                return [{
                    changes: {
                        status: 'COOKING',
                        items: startedItems
                    },
                    note: 'Transitioned ticket and items to COOKING'
                }];

            case 'COMPLETE_ITEM':
                if (status !== 'COOKING') {
                    throw new BusinessRuleViolationError(`Cannot complete item from status: ${status}`);
                }

                const newItems = items.map(item => {
                    if (item._data.name === action.itemName) {
                        return item._evolve({ status: 'COMPLETED' }, 'Item Completed', this.token);
                    }
                    return item;
                });

                const allCompleted = newItems.every(item => item._data.status === 'COMPLETED');
                const newStatus = allCompleted ? 'COMPLETED' : 'COOKING';

                return [{
                    changes: {
                        items: newItems,
                        status: newStatus
                    },
                    note: allCompleted ? 'All items completed, ticket COMPLETED' : `Completed item: ${action.itemName}`
                }];

            default:
                return [];
        }
    }
}
