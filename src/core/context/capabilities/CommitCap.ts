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
    static isAuthorized(cap: unknown): cap is CommitCap {
        return cap instanceof CommitCap && authorized.has(cap);
    }

    /** @internal - accessible by mintCommitCap via cast */
    private static _create(): CommitCap {
        const cap = new CommitCap();
        authorized.add(cap);
        return cap;
    }
}

/**
 * Restricted minting function.
 * ONLY import this from ContextFactory.
 */
export function mintCommitCap(): CommitCap {
    return (CommitCap as any)._create();
}
