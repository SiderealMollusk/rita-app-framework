import { Capability } from '../CapabilityBag';

const authorized = new WeakSet<AdminCap>();

/**
 * Authorizes system-level administrative operations.
 */
export class AdminCap extends Capability {
    private constructor() {
        super();
    }

    /** @internal */
    static createInternal(): AdminCap {
        const cap = new AdminCap();
        authorized.add(cap);
        return cap;
    }

    /** @internal */
    static isAuthorized(cap: unknown): cap is AdminCap {
        return cap instanceof AdminCap && authorized.has(cap);
    }
}
