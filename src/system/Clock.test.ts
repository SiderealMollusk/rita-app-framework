import { RitaClock, RealClock, FixedClock } from './Clock';

describe('RitaClock', () => {
    afterEach(() => {
        RitaClock.reset();
    });

    it('should use RealClock by default', () => {
        const now = RitaClock.now();
        const ts = RitaClock.timestamp();

        expect(now).toBeInstanceOf(Date);
        expect(typeof ts).toBe('number');

        // Sanity check (within last second)
        expect(Date.now() - ts).toBeLessThan(1000);
    });

    it('should support Mocking (FixedClock)', () => {
        const fixedDate = new Date('2025-01-01T00:00:00Z');
        RitaClock.mock(fixedDate);

        expect(RitaClock.now().toISOString()).toBe(fixedDate.toISOString());
        expect(RitaClock.timestamp()).toBe(fixedDate.getTime());
    });

    it('should reset to RealClock', () => {
        const fixedDate = new Date('2000-01-01');
        RitaClock.mock(fixedDate);
        expect(RitaClock.now()).toEqual(fixedDate);

        RitaClock.reset();
        expect(RitaClock.timestamp()).toBeGreaterThan(fixedDate.getTime());
    });
});

describe('RealClock', () => {
    it('should return current time', () => {
        const clock = new RealClock();
        expect(clock.now()).toBeInstanceOf(Date);
        expect(clock.timestamp()).toBeCloseTo(Date.now(), -100); // within 100ms
    });
});

describe('FixedClock', () => {
    it('should return fixed time', () => {
        const date = new Date('2022-02-02');
        const clock = new FixedClock(date);

        expect(clock.now()).toEqual(date);
        expect(clock.timestamp()).toBe(date.getTime());
    });
});
