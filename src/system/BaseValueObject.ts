import { AgentGuidanceError } from './AgentGuidanceError';
import { PolicyToken } from './DecisionPolicy';
import { RitaClock } from './Clock';

/**
 * The "Black Box" Recorder.
 * Every Value Object in the system inherits from this.
 * It enforces that you can't change state without leaving a trail.
 */
export abstract class BaseValueObject<TData> {
    public readonly _data: TData;
    public readonly _rev: number; // Revision Number (Optimistic Concurrency)

    // Provenance is built-in. You cannot opt-out.
    public readonly _provenance: {
        timestamp: Date;
        by: string;
        history: Array<{ at: Date; reason: string; diff: Partial<TData> }>;
    };

    /**
     * @param data The initial state.
     * @param provenance Optional specific provenance (usually for rehydration).
     * @param rev Optional revision (for rehydration), defaults to 1.
     */
    constructor(data: TData, provenance?: BaseValueObject<TData>['_provenance'], rev?: number) {
        this.validate(data); // "Always Valid" rule.

        this._data = Object.freeze({ ...data }); // Immutable by default.
        this._rev = rev || 1;

        // If no provenance provided (new object), start the history.
        this._provenance = provenance || {
            timestamp: RitaClock.now(),
            by: 'Constructor',
            history: []
        };
        Object.freeze(this._provenance);
    }

    /**
     * Users must implement validation logic.
     * Throws if data is invalid.
     */
    protected abstract validate(data: TData): void;

    /**
     * The ONLY way to change state.
     * Protected: Only accessible by DecisionPolicy (or tests via helpers).
     * 
     * @param changes Partial data to apply.
     * @param reason Why is this changing? (Mandatory)
     * @param token Proof that a Policy authorized this.
     */
    public _evolve(changes: Partial<TData>, reason: string, token: PolicyToken): this {
        if (!token || !(token instanceof PolicyToken)) {
            throw new AgentGuidanceError("Unauthorized Evolution! You must provide a PolicyToken.",
                "Ensure you are calling _evolve inside a DecisionPolicy and passing the policy's token.");
        }

        if (!reason) {
            throw new AgentGuidanceError("Unexplained Evolution! You must provide a reason string.",
                "Add a descriptive reason string to the _evolve call (e.g. 'Customer upgraded tier').");
        }


        // 1. Calculate new state
        const newData = { ...this._data, ...changes };

        // 2. Validate again (invariants must hold)
        this.validate(newData);

        // 3. Return NEW instance (Immutability) with appended history & incremented revision
        // @ts-expect-error - we know 'this.constructor' is the Child Class
        return new this.constructor(

            newData,
            {
                timestamp: RitaClock.now(),
                by: 'Policy', // We know it's a policy because of the token
                history: [
                    ...this._provenance.history,
                    {
                        at: RitaClock.now(),
                        reason: reason,
                        diff: changes
                    }
                ]
            },
            this._rev + 1 // Increment Revision
        );
    }
}


// TODO(P0-SAFETY): Change _evolve visibility from public to protected (or at least clearly “framework-only”). If it must remain public, enforce an unforgeable token (see DecisionPolicy TODO) so external callers cannot evolve even with “any”.

// TODO(P1): Add a simple revision number (rev) into provenance or data to make “save only changed” and optimistic concurrency easy later. Increment rev on evolve. Keep history as-is.

// TODO(P1): Decide whether provenance history should remain unbounded; add a note about potential truncation/compaction for long-lived objects (optional; punt).
