import { RitaId } from '../RitaId';
import { SimulatedIdGenerator } from '../../adapters/SimulatedIdGenerator';
import { UuidIdGenerator } from '../../adapters/UuidIdGenerator';

describe('RitaId', () => {
    afterEach(() => {
        RitaId._reset();
    });

    it('should generate UUIDs by default', () => {
        const id = RitaId.generate();
        expect(id).toMatch(/^[0-9a-f-]{36}$/); // Basic UUID check
    });

    it('should support prefix with UUID', () => {
        const id = RitaId.generate('user');
        expect(id).toMatch(/^user-[0-9a-f-]{36}$/);
    });

    it('should support switching to SimulatedIdGenerator', () => {
        const sim = new SimulatedIdGenerator();
        RitaId._setTestIdGenerator(sim);

        expect(RitaId.generate('order')).toBe('order-1');
        expect(RitaId.generate('order')).toBe('order-2');
    });

    it('should reset to UUID generator', () => {
        const sim = new SimulatedIdGenerator();
        RitaId._setTestIdGenerator(sim);
        RitaId.generate('test');

        RitaId._reset();

        const id = RitaId.generate();
        expect(id).not.toContain('test-');
        expect(id.length).toBeGreaterThan(10); // Check length for UUID
    });
});

describe('SimulatedIdGenerator', () => {
    it('should reset counters', () => {
        const sim = new SimulatedIdGenerator();
        sim.generate('a');
        sim.reset();
        expect(sim.generate('a')).toBe('a-1');
    });
});
