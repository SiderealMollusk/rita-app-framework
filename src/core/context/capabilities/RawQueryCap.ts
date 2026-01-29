import { Capability } from '../CapabilityBag';

const authorized = new WeakSet<RawQueryCap>();

/**
 * Authorizes raw database queries.
 */
export class RawQueryCap extends Capability {
    private constructor() {
        super();
    }

    /** @internal */
    static createInternal(): RawQueryCap {
        const cap = new RawQueryCap();
        authorized.add(cap);
        return cap;
    }

    /** @internal */
    static isAuthorized(cap: unknown): cap is RawQueryCap {
        return cap instanceof RawQueryCap && authorized.has(cap);
    }
}
