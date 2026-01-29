import { CommitScope } from './persistence/CommitScope';

export type SystemCtx = {
    readonly traceId: string;
    // Capability-based security: Commit scope is only present if explicitly allowed
    readonly commit?: (fn: (scope: CommitScope) => Promise<void>) => Promise<void>;
};


