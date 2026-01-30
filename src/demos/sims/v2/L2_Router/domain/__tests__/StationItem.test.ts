import { StationItem } from '../StationItem';
import { DomainValidationError } from '../../../../../../core';

describe('StationItem', () => {
    it('should create a station item', () => {
        const item = StationItem.create('si-1', 'ticket-1', 'Burger', 'Grill');
        expect(item.id).toBe('si-1');
        expect(item._data.ticketId).toBe('ticket-1');
        expect(item._data.itemName).toBe('Burger');
        expect(item._data.station).toBe('Grill');
    });

    it('should throw if ticketId is missing', () => {
        expect(() => new StationItem('si-1', { ticketId: '', itemName: 'Burger', station: 'Grill' })).toThrow(DomainValidationError);
    });

    it('should throw if itemName is missing', () => {
        expect(() => new StationItem('si-1', { ticketId: 'ticket-1', itemName: '', station: 'Grill' })).toThrow(DomainValidationError);
    });

    it('should throw if station is missing', () => {
        expect(() => new StationItem('si-1', { ticketId: 'ticket-1', itemName: 'Burger', station: '' })).toThrow(DomainValidationError);
    });
});
