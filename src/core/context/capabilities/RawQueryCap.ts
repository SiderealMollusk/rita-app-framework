import { Capability } from '../CapabilityBag';

const authorized = new WeakSet<RawQueryCap>();

export const MINT_RAW_QUERY_SYMBOL = Symbol('MintRawQueryCap');

/**
 * Authorizes raw database queries.
 */
export class RawQueryCap extends Capability {
    private constructor() {
        super();
    }

    /** @internal */
    static [MINT_RAW_QUERY_SYMBOL](): RawQueryCap {
        const cap = new RawQueryCap();
        authorized.add(cap);
        return cap;
    }

    /** @internal @deprecated Use Context promotion via ContextFactory or OperationScope instead. */
    static createInternal(): RawQueryCap {
        return this[MINT_RAW_QUERY_SYMBOL]();
    }

    /** @internal */
    static isAuthorized(cap: unknown): cap is RawQueryCap {
        return cap instanceof RawQueryCap && authorized.has(cap);
    }
}
