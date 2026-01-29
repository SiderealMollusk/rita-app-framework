import { Order } from './Order';

describe('Order Entity (PlaceOrder Demo)', () => {
    it('should throw on negative amount', () => {
        expect(() => new Order({
            id: 'o1',
            amount: -100,
            customerId: 'c1',
            status: 'PENDING'
        })).toThrow('Amount cannot be negative');
    });

    it('should throw on missing customerId', () => {
        expect(() => new Order({
            id: 'o2',
            amount: 100,
            customerId: '', // Missing
            status: 'PENDING'
        })).toThrow('Order must have a customerId');
    });
});

