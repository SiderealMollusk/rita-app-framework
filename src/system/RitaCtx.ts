import { CommitScope } from './persistence/CommitScope';

export type RitaCtx = {
    readonly traceId: string;

    // Command Metadata (Optional - only present on Commands)
    readonly idempotencyKey?: string;
    readonly interactionName?: string;

    /**
     * The Commit Capability.
     * 
     * Only available on Commands.
     * Use this to open a Write Transaction (CommitScope).
     */
    readonly commit?: (fn: (scope: CommitScope) => Promise<void>) => Promise<void>;
};

