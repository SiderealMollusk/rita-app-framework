import { InternalCtx } from '../InternalCtx';
import { SystemCtx } from '../SystemCtx';
import { TrustLevel } from '../BaseCtx';
import { CapabilityBag } from '../CapabilityBag';
import { CommitCap } from '../capabilities/CommitCap';
import { RawQueryCap } from '../capabilities/RawQueryCap';
import { AdminCap } from '../capabilities/AdminCap';

/**
 * Elevates a context to system level with full authority.
 */
export function promoteToSystem(ctx: InternalCtx): SystemCtx {
    return {
        traceId: ctx.traceId,
        trustLevel: TrustLevel.System,
        capabilities: new CapabilityBag([
            CommitCap.createInternal(),
            RawQueryCap.createInternal(),
            AdminCap.createInternal()
        ]),
        principal: ctx.principal
    };
}
