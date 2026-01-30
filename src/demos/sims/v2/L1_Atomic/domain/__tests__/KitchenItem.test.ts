import { KitchenItem } from '../KitchenItem';
import { DomainValidationError, PolicyToken } from '../../../../../../core';

describe('KitchenItem', () => {
    it('should create a kitchen item with status RECEIVED', () => {
        const item = KitchenItem.create('Burger');
        expect(item._data.name).toBe('Burger');
        expect(item._data.status).toBe('RECEIVED');
    });

    it('should throw if name is empty', () => {
        expect(() => new KitchenItem({ name: '', status: 'RECEIVED', course: 1 })).toThrow(DomainValidationError);
    });

    it('should throw if status is invalid', () => {
        expect(() => new KitchenItem({ name: 'Burger', status: 'INVALID' as any, course: 1 })).toThrow(DomainValidationError);
    });

    it('should evolve status correctly', () => {
        const item = KitchenItem.create('Burger');
        const token = (PolicyToken as any).createInternal();
        const evolved = item._evolve({ status: 'COOKING' }, 'Started cooking', token);
        expect(evolved._data.status).toBe('COOKING');
        expect(evolved._provenance.history[0].reason).toBe('Started cooking');
    });
});
