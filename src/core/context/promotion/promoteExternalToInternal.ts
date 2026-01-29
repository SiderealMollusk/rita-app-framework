import { ExternalCtx } from '../ExternalCtx';
import { InternalCtx } from '../InternalCtx';
import { TrustLevel } from '../BaseCtx';
import { CapabilityBag } from '../CapabilityBag';

/**
 * Promotes an external context to an internal trusted context.
 */
export function promoteExternalToInternal(ctx: ExternalCtx, principal?: string): InternalCtx {
    return {
        traceId: ctx.traceId,
        trustLevel: TrustLevel.Internal,
        capabilities: new CapabilityBag(),
        principal
    };
}
