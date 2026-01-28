import { AgentGuidanceError } from './AgentGuidanceError';
import { PolicyToken } from './DecisionPolicy'; // Import the Token

/**
 * The "Black Box" Recorder.
 * 
 * All Value Objects must extend this.
 * It enforces:
 * 1. Strict Immutability (Readonly)
 * 2. Data Provenance (Stack Trace on creation)
 * 3. Restricted Mutation (Only Policies can evolve via Token)
 */
export abstract class BaseValueObject<TSchema> {
    // The actual data storage
    public readonly _data: Readonly<TSchema>;

    // Provenance Metadata
    public readonly _provenance: {
        readonly createdAt: string;
        readonly createdBy: string; // Stack trace snippet or "Constructor"
        readonly history: readonly string[]; // List of reasons for previous mutations
    };

    constructor(data: TSchema, history: string[] = []) {
        this.validate(data);
        this._data = Object.freeze(data);

        // Capture Stack Trace to find "Who" created this
        // We hackily parse the Error stack to find the caller
        const stack = new Error().stack?.split('\n') || [];
        const caller = stack[2]?.trim() || 'Unknown';

        this._provenance = {
            createdAt: new Date().toISOString(),
            createdBy: caller,
            history: Object.freeze([...history])
        };
    }

    /**
     * RESTRICTED EVOLUTION.
     * Only accessible by authorized Policies holding a Token.
     * 
     * @param changes Partial data to update
     * @param reason MANDATORY reason string
     * @param token Proof of authorization
     */
    public _evolve(changes: Partial<TSchema>, reason: string, token: PolicyToken): this {
        // TRAP: The Unauthorized Mutation
        if (!token || !(token instanceof PolicyToken)) {
            throw new AgentGuidanceError(
                "Unauthorized State Change",
                "You tried to call _evolve() without a valid PolicyToken. " +
                "Only DecisionPolicy subclasses can evolve Value Objects."
            );
        }

        // TRAP: The Silent Mutation
        if (!reason || reason.trim().length === 0) {
            throw new AgentGuidanceError(
                "Missing Mutation Reason",
                "You calling _evolve() but left the 'reason' argument empty."
            );
        }

        const newData = { ...this._data, ...changes };
        const newHistory = [...this._provenance.history, `[${new Date().toISOString()}] ${reason}`];

        // Return new instance of the same class
        // We cast to 'any' to dynamically instantiate the child class
        return new (this.constructor as any)(newData, newHistory);
    }

    /**
     * Hook for validation logic.
     * Child classes should throw if data is invalid.
     */
    protected abstract validate(data: TSchema): void;

    /**
     * Helper to inspect data for logging (prevents large dumps).
     */
    public toJSON() {
        return {
            type: this.constructor.name,
            data: this._data,
            provenance: {
                evolutionCount: this._provenance.history.length,
                lastReason: this._provenance.history[this._provenance.history.length - 1]
            }
        };
    }
}
