const authorized = new WeakSet<PolicyToken>();

/**
 * Proof of authority for domain state evolution.
 * Only held by DecisionPolicy.
 */
export class PolicyToken {
    private constructor() {
    }

    /** @internal */
    static createInternal(): PolicyToken {
        const token = new PolicyToken();
        authorized.add(token);
        return token;
    }

    /** @internal */
    static isAuthorized(token: unknown): token is PolicyToken {
        return token instanceof PolicyToken && authorized.has(token);
    }
}
