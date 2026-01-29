import { SimulatedRandom } from '../SimulatedRandom';

describe('SimulatedRandom', () => {
    it('should initialize with default seed if not provided', () => {
        // @ts-ignore
        const rand = new SimulatedRandom(undefined);
        const rand1 = new SimulatedRandom(1);
        expect(rand.next()).toBe(rand1.next());
    });

    it('should be deterministic with the same seed', () => {
        const rand1 = new SimulatedRandom(123);
        const rand2 = new SimulatedRandom(123);

        expect(rand1.next()).toBe(rand2.next());
        expect(rand1.next()).toBe(rand2.next());
    });

    it('should produce different values with different seeds', () => {
        const rand1 = new SimulatedRandom(1);
        const rand2 = new SimulatedRandom(2);

        expect(rand1.next()).not.toBe(rand2.next());
    });

    it('should respect failure probability', () => {
        const rand = new SimulatedRandom(1);
        const val = rand.next(); // ~0.236

        const rand2 = new SimulatedRandom(1);
        expect(rand2.shouldFail(val + 0.1)).toBe(true);

        const rand3 = new SimulatedRandom(1);
        expect(rand3.shouldFail(val - 0.1)).toBe(false);
    });
});
