
import { BaseComponent } from '../BaseComponent';
import { SystemCtx } from '../SystemCtx';
import { CommitScope } from '../persistence/CommitScope';
import { AgentGuidanceError } from '../AgentGuidanceError';

/**
 * Base Command.
 * 
 * Commands:
 * 1. Perform Writes (Side Effects).
 * 2. Require `ctx.commit` capability.
 * 3. Enforce "One Commit Per Command" (usually).
 */
export abstract class BaseCommand<TInput, TOutput> extends BaseComponent<TInput, TOutput> {

    /**
     * Helper to execute a write operation.
     * Delegates to `ctx.commit`.
     */
    protected async commit(ctx: SystemCtx, fn: (scope: CommitScope) => Promise<void>): Promise<void> {
        if (!ctx.commit) {
            throw new AgentGuidanceError("Cmd: Missing Commit Capability! Are you running as a Query?",
                "Ensure this Command is invoked by a CommandInteraction or test that provides a commit capability.");
        }
        await ctx.commit(fn);
    }
}


