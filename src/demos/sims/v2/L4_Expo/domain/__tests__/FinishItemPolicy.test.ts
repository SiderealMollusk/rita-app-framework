import { FinishItemPolicy } from '../FinishItemPolicy';
import { KitchenTicket } from '../../../L1_Atomic/domain/KitchenTicket';
import { KitchenItem } from '../../../L1_Atomic/domain/KitchenItem';

describe('FinishItemPolicy', () => {
    let policy: FinishItemPolicy;

    beforeEach(() => {
        policy = new FinishItemPolicy();
    });

    it('should finish an item', () => {
        const item1 = KitchenItem.create('Burger');
        const ticket = KitchenTicket.create('tk-1', [item1]);

        const evolutions = (policy as any).decide(ticket, { kind: 'FINISH_ITEM', itemName: 'Burger' });
        expect(evolutions).toHaveLength(1);
        expect(evolutions[0].changes.items[0]._data.status).toBe('READY');
        expect(evolutions[0].changes.status).toBe('OPEN');
    });

    it('should return empty for unknown action', () => {
        const ticket = KitchenTicket.create('tk-1', []);
        expect((policy as any).decide(ticket, { kind: 'UNKNOWN' as any })).toEqual([]);
    });
});
