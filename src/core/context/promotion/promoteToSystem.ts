import { InternalCtx } from '../InternalCtx';
import { SystemCtx } from '../SystemCtx';
import { TrustLevel } from '../BaseCtx';
import { CapabilityBag } from '../CapabilityBag';
import { CommitCap, MINT_COMMIT_SYMBOL } from '../capabilities/CommitCap';
import { RawQueryCap, MINT_RAW_QUERY_SYMBOL } from '../capabilities/RawQueryCap';
import { AdminCap, MINT_ADMIN_SYMBOL } from '../capabilities/AdminCap';

/**
 * Elevates a context to system level with full authority.
 */
export function promoteToSystem(ctx: InternalCtx): SystemCtx {
    return {
        traceId: ctx.traceId,
        trustLevel: TrustLevel.System,
        capabilities: new CapabilityBag([
            (CommitCap as any)[MINT_COMMIT_SYMBOL](),
            (RawQueryCap as any)[MINT_RAW_QUERY_SYMBOL](),
            (AdminCap as any)[MINT_ADMIN_SYMBOL]()
        ]),
        principal: ctx.principal
    };
}
