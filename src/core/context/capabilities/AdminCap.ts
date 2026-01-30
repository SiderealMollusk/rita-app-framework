import { Capability } from '../CapabilityBag';

const authorized = new WeakSet<AdminCap>();

export const MINT_ADMIN_SYMBOL = Symbol('MintAdminCap');

/**
 * Authorizes system-level administrative operations.
 */
export class AdminCap extends Capability {
    private constructor() {
        super();
    }

    /** @internal */
    static [MINT_ADMIN_SYMBOL](): AdminCap {
        const cap = new AdminCap();
        authorized.add(cap);
        return cap;
    }

    /** @internal @deprecated Use Context promotion via ContextFactory or OperationScope instead. */
    static createInternal(): AdminCap {
        return this[MINT_ADMIN_SYMBOL]();
    }

    /** @internal */
    static isAuthorized(cap: unknown): cap is AdminCap {
        return cap instanceof AdminCap && authorized.has(cap);
    }
}
