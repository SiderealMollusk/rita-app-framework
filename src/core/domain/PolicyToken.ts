const authorized = new WeakSet<PolicyToken>();

export const MINT_SYMBOL = Symbol('MintPolicyToken');

/**
 * Proof of authority for domain state evolution.
 * Only held by DecisionPolicy.
 */
export class PolicyToken {
    private constructor() {
    }

    /** @internal */
    static [MINT_SYMBOL](): PolicyToken {
        const token = new PolicyToken();
        authorized.add(token);
        return token;
    }

    /** @internal @deprecated Use OperationScope.authorize() instead. */
    static createInternal(): PolicyToken {
        return this[MINT_SYMBOL]();
    }

    /** @internal */
    static isAuthorized(token: unknown): token is PolicyToken {
        return token instanceof PolicyToken && authorized.has(token);
    }
}
