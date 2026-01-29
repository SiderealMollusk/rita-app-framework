
import { CommitScope } from './CommitScope';

/**
 * In-Memory Limit Scope for Tests/Demos.
 */
export class InMemoryCommitScope implements CommitScope {
    readonly _isCommitScope = true;

    // We can add "pending writes" or "committed events" here for assertions in tests.
    public readonly writtenIds: string[] = [];

    constructor() { }
}

