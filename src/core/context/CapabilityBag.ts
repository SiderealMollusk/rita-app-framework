/**
 * Authority tokens that grant access to privileged operations.
 * Capabilities are designed to be unforgeable.
 */
export abstract class Capability {
    /**
     * Marker to ensure that even structurally identical classes
     * are treated as distinct capability types.
     */
    protected readonly _capabilityKind: string;

    constructor() {
        this._capabilityKind = this.constructor.name;
    }
}

/**
 * A container for unforgeable authority tokens.
 */
export class CapabilityBag {
    private readonly capabilities = new Set<Capability>();

    constructor(capabilities: Capability[] = []) {
        capabilities.forEach(cap => this.capabilities.add(cap));
    }

    /**
     * Checks if the bag contains a capability of the given type.
     */
    public has<T extends Capability>(type: Function & { prototype: T, isAuthorized?: (cap: any) => cap is T }): boolean {
        for (const cap of this.capabilities) {
            if (cap instanceof type) {
                if (type.isAuthorized && !type.isAuthorized(cap)) continue;
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the capability of the given type, or throws if missing.
     */
    public require<T extends Capability>(type: Function & { prototype: T, isAuthorized?: (cap: any) => cap is T }): T {
        for (const cap of this.capabilities) {
            if (cap instanceof type) {
                if (type.isAuthorized && !type.isAuthorized(cap)) continue;
                return cap as T;
            }
        }
        throw new Error(`Missing required capability: ${(type as any).name}`);
    }
}
