import { KitchenHexagon } from '../module';

describe('KitchenHexagon L1', () => {
    it('should be well-formed', () => {
        expect(KitchenHexagon.name).toBe('Kitchen_L1');
        expect(KitchenHexagon.useCases.length).toBeGreaterThan(0);
        expect(KitchenHexagon.policies.length).toBeGreaterThan(0);
    });
});
