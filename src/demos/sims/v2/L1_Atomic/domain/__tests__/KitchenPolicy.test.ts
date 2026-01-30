import { KitchenPolicy } from '../KitchenPolicy';
import { KitchenTicket } from '../KitchenTicket';
import { KitchenItem } from '../KitchenItem';
import { BusinessRuleViolationError } from '../../../../../../core';

describe('KitchenPolicy', () => {
    let policy: KitchenPolicy;
    let ticket: KitchenTicket;

    beforeEach(() => {
        policy = new KitchenPolicy();
        const item = KitchenItem.create('Burger');
        ticket = KitchenTicket.create('ticket-1', [item]);
    });

    describe('START_COOKING', () => {
        it('should transition to COOKING if status is RECEIVED', () => {
            const evolutions = (policy as any).decide(ticket, { kind: 'START_COOKING' });
            expect(evolutions).toHaveLength(1);
            expect(evolutions[0].changes.status).toBe('COOKING');
            expect(evolutions[0].changes.items).toHaveLength(1);
            expect(evolutions[0].changes.items[0]._data.status).toBe('COOKING');
        });

        it('should throw if status is not RECEIVED', () => {
            const token = (policy as any).token;
            const cookingTicket = ticket._evolve({ status: 'COOKING' }, 'manual', token);
            expect(() => (policy as any).decide(cookingTicket, { kind: 'START_COOKING' })).toThrow(BusinessRuleViolationError);
        });
    });

    describe('COMPLETE_ITEM', () => {
        it('should transition item to COMPLETED and ticket to COMPLETED if all items done', () => {
            const token = (policy as any).token;
            const cookingItem = ticket._data.items[0]._evolve({ status: 'COOKING' }, 'manual', token);
            const cookingTicket = ticket._evolve({ status: 'COOKING', items: [cookingItem] }, 'manual', token);

            const evolutions = (policy as any).decide(cookingTicket, { kind: 'COMPLETE_ITEM', itemName: 'Burger' });
            expect(evolutions).toHaveLength(1);
            expect(evolutions[0].changes.status).toBe('COMPLETED');
            expect(evolutions[0].changes.items[0]._data.status).toBe('COMPLETED');
        });

        it('should remain in COOKING if not all items done', () => {
            const item1 = KitchenItem.create('Burger');
            const item2 = KitchenItem.create('Fries');
            const token = (policy as any).token;

            const cookingItem1 = item1._evolve({ status: 'COOKING' }, 'manual', token);
            const cookingItem2 = item2._evolve({ status: 'COOKING' }, 'manual', token);
            const cookingTicket = KitchenTicket.create('ticket-1', [cookingItem1, cookingItem2])
                ._evolve({ status: 'COOKING' }, 'manual', token);

            const evolutions = (policy as any).decide(cookingTicket, { kind: 'COMPLETE_ITEM', itemName: 'Burger' });
            expect(evolutions[0].changes.status).toBe('COOKING');
            expect(evolutions[0].changes.items[0]._data.status).toBe('COMPLETED');
            expect(evolutions[0].changes.items[1]._data.status).toBe('COOKING');
        });

        it('should throw if status is not COOKING', () => {
            expect(() => (policy as any).decide(ticket, { kind: 'COMPLETE_ITEM', itemName: 'Burger' })).toThrow(BusinessRuleViolationError);
        });
    });

    it('should return empty evolutions for unknown action', () => {
        const evolutions = (policy as any).decide(ticket, { kind: 'UNKNOWN' as any });
        expect(evolutions).toEqual([]);
    });
});
