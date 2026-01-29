import { Capability } from '../CapabilityBag';

const authorized = new WeakSet<CommitCap>();

/**
 * Authorizes durable writes (state changes).
 */
export class CommitCap extends Capability {
    private constructor() {
        super();
    }

    /** @internal */
    static createInternal(): CommitCap {
        const cap = new CommitCap();
        authorized.add(cap);
        return cap;
    }

    /** @internal */
    static isAuthorized(cap: unknown): cap is CommitCap {
        return cap instanceof CommitCap && authorized.has(cap);
    }
}
