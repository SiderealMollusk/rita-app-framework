import { DecisionPolicy, Evolution, BusinessRuleViolationError } from '../../../../../core';
import { KitchenTicket } from '../../L1_Atomic/domain/KitchenTicket';

export type TicketClosingAction = { kind: 'CLOSE_TICKET' };

export class TicketClosingPolicy extends DecisionPolicy<KitchenTicket, TicketClosingAction> {
    protected decide(target: KitchenTicket, action: TicketClosingAction): Evolution<KitchenTicket>[] {
        if (action.kind !== 'CLOSE_TICKET') return [];

        const allReady = target._data.items.every(item =>
            item._data.status === 'READY' || item._data.status === 'COMPLETED'
        );

        if (!allReady) {
            throw new BusinessRuleViolationError('Cannot close ticket: not all items are ready');
        }

        return [{
            changes: {
                status: 'CLOSED'
            },
            note: 'Ticket closed'
        }];
    }
}
