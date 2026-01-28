import { BaseEntity } from './BaseEntity';

class TestEntity extends BaseEntity<{ id: string; name: string }> {
    protected validate(data: { id: string; name: string }): void {
        if (!data.id) throw new Error("ID required");
    }
}

describe('BaseEntity', () => {
    it('should expose the id property', () => {
        const entity = new TestEntity({ id: '123', name: 'Test' });
        expect(entity.id).toBe('123');
    });

    it('should check equality based on ID', () => {
        const e1 = new TestEntity({ id: '123', name: 'A' });
        const e2 = new TestEntity({ id: '123', name: 'B' }); // Same ID, different data
        const e3 = new TestEntity({ id: '456', name: 'A' });

        expect(e1.equals(e2)).toBe(true);
        expect(e1.equals(e3)).toBe(false);
    });

    it('should return false for non-entity comparison', () => {
        const e1 = new TestEntity({ id: '123', name: 'A' });
        // @ts-ignore
        expect(e1.equals({ id: '123' })).toBe(false);
    });
});
