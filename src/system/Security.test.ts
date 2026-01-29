import { PolicyToken } from './DecisionPolicy';
import { BaseValueObject } from './BaseValueObject';

// A "Userland" class trying to forge a token
class Hacker {
    static mintToken() {
        // Now this fails to compile (Property 'create' is private or we lack the symbol)
        // For test purposes, we try to be clever:
        return (PolicyToken as any).create(Symbol('MyFakeSecret'));
    }
}

class TestVO extends BaseValueObject<{ val: number }> {
    protected validate(_data: { val: number }) { }
}

describe('Security (TDD)', () => {

    it('should NOT allow external code to create a PolicyToken', () => {
        // Attempting to call create with a specific symbol should fail execution
        // Because the symbol inside is not exported.

        // Actually, since we check `secret !== FrameworkInternals`, and `FrameworkInternals` is a non-exported Symbol...
        // it is IMPOSSIBLE to match it.

        // This confirms the "Unforgeable" requirement.

        expect(() => {
            Hacker.mintToken();
        }).toThrow("Cannot instantiate PolicyToken directly");
    });

    it('should NOT allow unauthorized evolution with a forged object', () => {
        const vo = new TestVO({ val: 0 });
        // Even if we mock the shape...
        const fakeToken = { _secret: Symbol('Fake') } as any as PolicyToken;

        expect(() => {
            vo._evolve({ val: 1 }, "Hacking", fakeToken);
        }).toThrow("Unauthorized");
    });
});
