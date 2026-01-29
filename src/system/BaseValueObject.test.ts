import { PolicyToken, _TEST_createPolicyToken } from './DecisionPolicy';
import { BaseValueObject } from './BaseValueObject';
import { RitaClock } from './Clock';


// Use the exported test helper
const createTestToken = _TEST_createPolicyToken;

// --- Test VO ---
class CounterVO extends BaseValueObject<{ count: number }> {
    protected validate(data: { count: number }): void {
        if (data.count < 0) throw new Error("Negative Count");
    }
}

describe('BaseValueObject', () => {

    it('should initialize with Revision 1', () => {
        const vo = new CounterVO({ count: 0 });
        expect(vo._data.count).toBe(0);
        expect(vo._rev).toBe(1);
    });

    it('should increment Revision on evolution', () => {

        const vo = new CounterVO({ count: 0 });
        const token = createTestToken(); // We cheat to get a valid token

        const v2 = vo._evolve({ count: 1 }, "Inc", token);

        expect(v2._data.count).toBe(1);
        expect(v2._rev).toBe(2);

        const v3 = v2._evolve({ count: 5 }, "Jump", token);
        expect(v3._data.count).toBe(5);
        expect(v3._rev).toBe(3);
    });

    it('should enforce Immutability (New Instances)', () => {
        const vo = new CounterVO({ count: 0 });
        const token = createTestToken();
        const v2 = vo._evolve({ count: 1 }, "Inc", token);

        expect(vo).not.toBe(v2);
        expect(vo._data.count).toBe(0); // Original untouched
    });

    it('should throw if reason is missing', () => {
        const token = _TEST_createPolicyToken();
        const vo = new CounterVO({ count: 10 });

        expect(() => {
            vo._evolve({ count: 11 }, '', token);

        }).toThrow('Unexplained Evolution');
    });

    it('should validate inputs', () => {

        expect(() => new CounterVO({ count: -1 })).toThrow("Negative Count");

        const vo = new CounterVO({ count: 0 });
        const token = createTestToken();

        expect(() => {
            vo._evolve({ count: -5 }, "Bad Update", token);
        }).toThrow("Negative Count");
    });

});
