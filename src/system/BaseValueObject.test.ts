import { BaseValueObject } from './BaseValueObject';
import { AgentGuidanceError } from './AgentGuidanceError';

class TestVO extends BaseValueObject<{ count: number; status: string }> {
    protected validate(data: { count: number; status: string }): void {
        if (data.count < 0) {
            throw new Error('Count cannot be negative');
        }
    }
}

describe('BaseValueObject', () => {
    it('should create an immutable instance with provenance', () => {
        const vo = new TestVO({ count: 10, status: 'active' });

        expect(vo._data.count).toBe(10);
        expect(vo._provenance.createdBy).toBeDefined(); // Should capture stack trace
        expect(Object.isFrozen(vo._data)).toBe(true);
    });

    it('should validate data on creation', () => {
        expect(() => new TestVO({ count: -1, status: 'bad' })).toThrow('Count cannot be negative');
    });

    describe('Evolution (_evolve)', () => {
        const vo = new TestVO({ count: 10, status: 'active' });
        // Mock a token (we cast to any to bypass private check if needed, or better, we just allow any object for the test if the runtime check is loose? 
        // Wait, runtime check is: if (!token || !(token instanceof PolicyToken))
        // So we need a real PolicyToken instance.
        // We can't import PolicyToken class creation method because it's private static or just the class is exported. 
        // We can use a workaround: The runtime check uses `instanceof PolicyToken`. 
        // We can use the exported PolicyToken class.

        // However, PolicyToken constructor is not private, but its fields are.
        // Let's create a fake token helper.
    });
});

// We need to import PolicyToken for the test to work cleanly
import { PolicyToken } from './DecisionPolicy';

describe('BaseValueObject Evolution', () => {

    it('should evolve correctly with a valid token and reason', () => {
        const vo = new TestVO({ count: 10, status: 'active' });
        // Hack: Create a token via a backdoor or just instantiate if constructor is public (it is public by default in TS classes unless marked private)
        // In DecisionPolicy.ts: export class PolicyToken { private readonly _secret ... static create() ... }
        // The constructor is implicitly public but empty.
        const token = new PolicyToken();

        const next = vo._evolve({ count: 11 }, "User clicked the increment button", token);

        expect(next).not.toBe(vo);
        expect(next._data.count).toBe(11);
        expect((next as any)._provenance.history[0]).toContain('User clicked');
    });

    it('should TRAP missing token', () => {
        const vo = new TestVO({ count: 10, status: 'active' });
        expect(() => (vo as any)._evolve({ count: 11 }, "reason", null)).toThrow("Unauthorized State Change");
    });

    it('should TRAP missing reason', () => {
        const vo = new TestVO({ count: 10, status: 'active' });
        const token = new PolicyToken();
        expect(() => vo._evolve({ count: 12 }, "", token)).toThrow("Missing Mutation Reason");
    });
});
