import { TicketClosingPolicy } from '../TicketClosingPolicy';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { KitchenItem } from '../../../L1_Atomic/domain/KitchenItem';
import { BusinessRuleViolationError, PolicyToken } from '../../../../../../core';

describe('TicketClosingPolicy', () => {
    let policy: TicketClosingPolicy;
    let token: PolicyToken;

    beforeEach(() => {
        policy = new TicketClosingPolicy();
        token = (policy as any).token;
    });

    it('should close ticket if all items are READY', () => {
        const item1 = KitchenItem.create('Burger')._evolve({ status: 'READY' }, 'ready', token);
        const ticket = KitchenTicket.create('tk-1', [item1]);

        const evolutions = (policy as any).decide(ticket, { kind: 'CLOSE_TICKET' });
        expect(evolutions).toHaveLength(1);
        expect(evolutions[0].changes.status).toBe('CLOSED');
    });

    it('should close ticket if all items are COMPLETED', () => {
        const item1 = KitchenItem.create('Burger')._evolve({ status: 'COMPLETED' }, 'completed', token);
        const ticket = KitchenTicket.create('tk-1', [item1]);

        const evolutions = (policy as any).decide(ticket, { kind: 'CLOSE_TICKET' });
        expect(evolutions).toHaveLength(1);
        expect(evolutions[0].changes.status).toBe('CLOSED');
    });

    it('should throw if some items are not ready', () => {
        const item1 = KitchenItem.create('Burger')._evolve({ status: 'READY' }, 'ready', token);
        const item2 = KitchenItem.create('Steak'); // RECEIVED
        const ticket = KitchenTicket.create('tk-1', [item1, item2]);

        expect(() => (policy as any).decide(ticket, { kind: 'CLOSE_TICKET' })).toThrow(BusinessRuleViolationError);
    });

    it('should return empty for unknown action', () => {
        const ticket = KitchenTicket.create('tk-1', []);
        expect((policy as any).decide(ticket, { kind: 'UNKNOWN' as any })).toEqual([]);
    });
});
