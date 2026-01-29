import { RitaClock } from './RitaClock';
import { PolicyToken } from './PolicyToken';
import { AgentGuidanceError } from '../errors/AgentGuidanceError';

export interface ProvenanceEntry<T> {
    at: Date;
    reason: string;
    diff: Partial<T>;
}

export interface Provenance<T> {
    timestamp: Date;
    by: string;
    history: ProvenanceEntry<T>[];
}

/**
 * Immutable domain state with provenance history.
 */
export abstract class BaseValueObject<TData> {
    public readonly _data: Readonly<TData>;
    public readonly _rev: number;
    public readonly _provenance: Readonly<Provenance<TData>>;

    constructor(data: TData, provenance?: Provenance<TData>, rev?: number) {
        this.validate(data);

        this._data = Object.freeze({ ...data });
        this._rev = rev || 1;
        this._provenance = Object.freeze(provenance || {
            timestamp: RitaClock.now(),
            by: 'Constructor',
            history: []
        });
    }

    /**
     * Ensures the data maintains domain invariants.
     * Throws if invalid.
     */
    protected abstract validate(data: TData): void;

    /**
     * The ONLY way to evolve state. Requires a PolicyToken.
     */
    public _evolve(changes: Partial<TData>, reason: string, token: PolicyToken): this {
        if (!PolicyToken.isAuthorized(token)) {
            throw new AgentGuidanceError(
                "Unauthorized Evolution! You must provide a valid PolicyToken.",
                "Ensure you are calling _evolve inside a DecisionPolicy."
            );
        }

        if (!reason) {
            throw new AgentGuidanceError(
                "Unexplained Evolution! You must provide a reason.",
                "Add a descriptive reason for this state change."
            );
        }

        const newData = { ...this._data, ...changes };
        this.validate(newData);

        const now = RitaClock.now();
        const newProvenance: Provenance<TData> = {
            ...this._provenance,
            history: [
                ...this._provenance.history,
                { at: now, reason, diff: changes }
            ]
        };

        // @ts-expect-error - constructor of child class
        return new this.constructor(newData, newProvenance, this._rev + 1);
    }

    /**
     * Value equality check.
     */
    public equals(other: BaseValueObject<TData>): boolean {
        if (!other) return false;
        return JSON.stringify(this._data) === JSON.stringify(other._data);
    }
}
