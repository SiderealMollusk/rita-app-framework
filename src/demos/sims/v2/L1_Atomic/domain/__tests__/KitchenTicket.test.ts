import { KitchenTicket } from '../KitchenTicket';
import { KitchenItem } from '../KitchenItem';
import { DomainValidationError, PolicyToken } from '../../../../../../core';

describe('KitchenTicket', () => {
    it('should create a kitchen ticket with status RECEIVED', () => {
        const item = KitchenItem.create('Burger');
        const ticket = KitchenTicket.create('ticket-1', [item]);
        expect(ticket.id).toBe('ticket-1');
        expect(ticket._data.items).toHaveLength(1);
        expect(ticket._data.status).toBe('RECEIVED');
    });

    it('should throw if items are missing', () => {
        expect(() => new KitchenTicket('ticket-1', { items: null as any, status: 'RECEIVED' })).toThrow(DomainValidationError);
    });

    it('should throw if status is invalid', () => {
        expect(() => new KitchenTicket('ticket-1', { items: [], status: 'INVALID' as any })).toThrow(DomainValidationError);
    });

    it('should evolve status and items correctly', () => {
        const item = KitchenItem.create('Burger');
        const ticket = KitchenTicket.create('ticket-1', [item]);
        const token = (PolicyToken as any).createInternal();

        const evolvedItem = item._evolve({ status: 'COOKING' }, 'Item started', token);
        const evolvedTicket = ticket._evolve({ status: 'COOKING', items: [evolvedItem] }, 'Ticket started', token);

        expect(evolvedTicket._data.status).toBe('COOKING');
        expect(evolvedTicket._data.items[0]._data.status).toBe('COOKING');
    });
});
