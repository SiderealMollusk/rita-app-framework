import { UuidIdGenerator } from '../UuidIdGenerator';

jest.mock('uuid', () => ({
    v4: () => 'mock-uuid'
}));

describe('UuidIdGenerator', () => {
    it('should generate ID with prefix', () => {
        const gen = new UuidIdGenerator();
        expect(gen.generate('p')).toBe('p-mock-uuid');
    });

    it('should generate ID without prefix', () => {
        const gen = new UuidIdGenerator();
        expect(gen.generate()).toBe('mock-uuid');
    });
});
