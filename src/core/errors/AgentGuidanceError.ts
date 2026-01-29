/**
 * The "Instructional Exception".
 * This error is designed to be read by an AI Agent.
 * It provides a specific "fix" instruction along with the error.
 */
export class AgentGuidanceError extends Error {
    readonly fix: string;

    constructor(reason: string, fix: string) {
        super(`🛑 AGENT HALT: ${reason}\n--> FIX: ${fix}`);
        this.name = 'AgentGuidanceError';
        this.fix = fix;

        // Restore prototype chain for instanceof checks
        Object.setPrototypeOf(this, AgentGuidanceError.prototype);
    }
}
