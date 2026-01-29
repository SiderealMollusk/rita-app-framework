import { InternalCtx } from '../InternalCtx';
import { CommandCtx } from '../CommandCtx';
import { TrustLevel } from '../BaseCtx';
import { CapabilityBag } from '../CapabilityBag';
import { CommitCap } from '../capabilities/CommitCap';

/**
 * Promotes an internal context to a command context with write authority.
 */
export function promoteInternalToCommand(ctx: InternalCtx): CommandCtx {
    return {
        traceId: ctx.traceId,
        trustLevel: TrustLevel.Command,
        capabilities: new CapabilityBag([CommitCap.createInternal()]),
        principal: ctx.principal
    };
}
