import { BaseValueObject, Provenance } from '../BaseValueObject';
import { BaseEntity } from '../BaseEntity';
import { DecisionPolicy, Evolution } from '../DecisionPolicy';
import { RitaClock } from '../RitaClock';
import { ContextFactory } from '../../context/promotion/ContextFactory';
import { PolicyToken } from '../PolicyToken';

// Mock Implementation for testing
interface MockData {
    name: string;
    age: number;
}

class MockVO extends BaseValueObject<MockData> {
    protected validate(data: MockData): void {
        if (data.age < 0) throw new Error('Age must be positive');
    }

    protected _instantiate(data: MockData, provenance: Provenance<MockData>, rev: number): this {
        // @ts-expect-error - constructor is protected/private in real implementation but here safe
        return new this.constructor(data, provenance, rev);
    }
}

class MockEntity extends BaseEntity<MockData> {
    protected validate(data: MockData): void {
        if (!data.name) throw new Error('Name required');
    }
}

class MockPolicy extends DecisionPolicy<MockVO, { newAge: number }> {
    protected decide(target: MockVO, context: { newAge: number }): Evolution<MockVO>[] {
        return [{
            changes: { age: context.newAge },
            note: 'Updated age'
        }];
    }
}

describe('Domain Primitives', () => {
    afterEach(() => {
        RitaClock._reset();
    });

    describe('BaseValueObject', () => {
        it('should throw if forged', () => {
            const forged = new (PolicyToken as any)();
            expect(PolicyToken.isAuthorized(forged)).toBe(false);

            const vo = new MockVO({ name: 'Test', age: 25 });
            expect(() => vo._evolve({ age: 30 }, 'Birthday', forged)).toThrow('Unauthorized Evolution');
        });

        it('should be immutable and valid', () => {
            const vo = new MockVO({ name: 'Test', age: 25 });
            expect(vo._data.age).toBe(25);
            expect(() => new MockVO({ name: 'Test', age: -1 })).toThrow('Age must be positive');

            // Check immutability
            // @ts-expect-error
            expect(() => { vo._data.age = 30; }).toThrow();
        });

        it('should record provenance', () => {
            const vo = new MockVO({ name: 'Test', age: 25 });
            expect(vo._provenance.timestamp).toBeInstanceOf(Date);
            expect(vo._provenance.by).toBe('Constructor');
        });

        it('should evolve correctly with a token', () => {
            const vo = new MockVO({ name: 'Test', age: 25 });
            const token = (PolicyToken as any).createInternal();
            const evolved = vo._evolve({ age: 30 }, 'Birthday', token);

            expect(evolved._data.age).toBe(30);
            expect(evolved._rev).toBe(2);
            expect(evolved._provenance.history).toHaveLength(1);
            expect(evolved._provenance.history[0].reason).toBe('Birthday');
        });

        it('should throw when evolving without a valid token', () => {
            const vo = new MockVO({ name: 'Test', age: 25 });
            expect(() => vo._evolve({ age: 30 }, 'Birthday', null as any)).toThrow('Unauthorized Evolution');
        });

        it('should throw when evolving without a reason', () => {
            const vo = new MockVO({ name: 'Test', age: 25 });
            const token = (PolicyToken as any).createInternal();
            expect(() => vo._evolve({ age: 30 }, '', token)).toThrow('Unexplained Evolution');
        });

        it('should check for value equality', () => {
            const vo1 = new MockVO({ name: 'Test', age: 25 });
            const vo2 = new MockVO({ name: 'Test', age: 25 });
            const vo3 = new MockVO({ name: 'Other', age: 25 });

            expect(vo1.equals(vo2)).toBe(true);
            expect(vo1.equals(vo3)).toBe(false);
            expect(vo1.equals(null as any)).toBe(false);
        });
    });

    describe('BaseEntity', () => {
        it('should have identity', () => {
            const entity = new MockEntity('id-1', { name: 'Test', age: 25 });
            expect(entity.id).toBe('id-1');
        });

        it('should check for identity equality', () => {
            const e1 = new MockEntity('id-1', { name: 'Test', age: 25 });
            const e2 = new MockEntity('id-1', { name: 'Other', age: 30 });
            const e3 = new MockEntity('id-2', { name: 'Test', age: 25 });

            expect(e1.equals(e2)).toBe(true);
            expect(e1.equals(e3)).toBe(false);
            expect(e1.equals(null as any)).toBe(false);
            expect(e1.equals({ id: 'id-1' } as any)).toBe(false);
        });
    });

    describe('DecisionPolicy', () => {
        it('should execute and apply changes', () => {
            const vo = new MockVO({ name: 'Test', age: 25 });
            const policy = new MockPolicy();
            const ctx = ContextFactory.promoteToInternal(ContextFactory.createExternal());

            const result = policy.execute(ctx, vo, { newAge: 30 });

            expect(result._data.age).toBe(30);
            expect(result._provenance.history[0].reason).toBe('[Policy: MockPolicy] Updated age');
        });

        it('should handle zero evolutions', () => {
            class NoopPolicy extends DecisionPolicy<MockVO, void> {
                protected decide(): Evolution<MockVO>[] { return []; }
            }
            const vo = new MockVO({ name: 'Test', age: 25 });
            const policy = new NoopPolicy();
            const ctx = ContextFactory.promoteToInternal(ContextFactory.createExternal());

            const result = policy.execute(ctx, vo, undefined);
            expect(result).toBe(vo);
        });

        it('should record exception and rethrow on error', () => {
            class ThrowingPolicy extends DecisionPolicy<MockVO, void> {
                protected decide(): Evolution<MockVO>[] { throw new Error('Policy failed'); }
            }
            const vo = new MockVO({ name: 'Test', age: 25 });
            const policy = new ThrowingPolicy();
            const ctx = ContextFactory.promoteToInternal(ContextFactory.createExternal());

            expect(() => policy.execute(ctx, vo, undefined)).toThrow('Policy failed');
        });
    });

    describe('RitaClock', () => {
        it('should return current time', () => {
            expect(RitaClock.now()).toBeInstanceOf(Date);
        });

        it('should allow test clock', () => {
            const testDate = new Date('2023-01-01');
            RitaClock._setTestClock({ now: () => testDate });
            expect(RitaClock.now()).toBe(testDate);
        });
    });
});
