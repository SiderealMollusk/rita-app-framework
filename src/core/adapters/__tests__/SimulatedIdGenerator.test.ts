import { SimulatedIdGenerator } from '../SimulatedIdGenerator';

describe('SimulatedIdGenerator', () => {
    it('should generate ID with default prefix', () => {
        const gen = new SimulatedIdGenerator();
        expect(gen.generate()).toBe('id-1');
        expect(gen.generate()).toBe('id-2');
    });

    it('should generate ID with custom prefix', () => {
        const gen = new SimulatedIdGenerator();
        expect(gen.generate('user')).toBe('user-1');
    });

    it('should reset counters', () => {
        const gen = new SimulatedIdGenerator();
        gen.generate('test');
        gen.reset();
        expect(gen.generate('test')).toBe('test-1');
    });
});
