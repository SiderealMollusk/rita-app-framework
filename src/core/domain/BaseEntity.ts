import { BaseValueObject, Provenance } from './BaseValueObject';

/**
 * Immutable domain state with Identity.
 */
export abstract class BaseEntity<TData, TId = string> extends BaseValueObject<TData> {
    public readonly id: TId;

    constructor(id: TId, data: TData, provenance?: Provenance<TData>, rev?: number) {
        super(data, provenance, rev);
        this.id = id;
    }

    /**
     * Identity-based equality check.
     */
    public equals(other: BaseEntity<TData, TId>): boolean {
        if (!other) return false;
        if (!(other instanceof BaseEntity)) return false;
        return this.id === other.id;
    }
}
