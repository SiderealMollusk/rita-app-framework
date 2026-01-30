import { Capability } from '../CapabilityBag';

const authorized = new WeakSet<CommitCap>();

export const MINT_COMMIT_SYMBOL = Symbol('MintCommitCap');

/**
 * Authorizes durable writes (state changes).
 */
export class CommitCap extends Capability {
    private constructor() {
        super();
    }

    /** @internal */
    static [MINT_COMMIT_SYMBOL](): CommitCap {
        const cap = new CommitCap();
        authorized.add(cap);
        return cap;
    }

    /** @internal @deprecated Use Context promotion via ContextFactory or OperationScope instead. */
    static createInternal(): CommitCap {
        return this[MINT_COMMIT_SYMBOL]();
    }

    /** @internal */
    static isAuthorized(cap: unknown): cap is CommitCap {
        return cap instanceof CommitCap && authorized.has(cap);
    }
}
