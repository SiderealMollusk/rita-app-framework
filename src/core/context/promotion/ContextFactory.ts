import { v4 as uuidv4 } from 'uuid';
import { TrustLevel } from '../BaseCtx';
import { CapabilityBag } from '../CapabilityBag';
import { ExternalCtx } from '../ExternalCtx';
import { InternalCtx } from '../InternalCtx';
import { CommandCtx } from '../CommandCtx';
import { SystemCtx } from '../SystemCtx';
import { CommitCap } from '../capabilities/CommitCap';
import { RawQueryCap } from '../capabilities/RawQueryCap';
import { AdminCap } from '../capabilities/AdminCap';

export class ContextFactory {
    /**
     * Creates a new untrusted external context.
     */
    static createExternal(traceId?: string): ExternalCtx {
        return {
            traceId: traceId || uuidv4(),
            trustLevel: TrustLevel.External,
            capabilities: new CapabilityBag()
        };
    }

    /**
     * Promotes an external context to an internal trusted context.
     */
    static promoteToInternal(ctx: ExternalCtx, principal?: string): InternalCtx {
        // Promotion logic: check authentication, etc.
        // For now, we just create the new context.
        return {
            traceId: ctx.traceId,
            trustLevel: TrustLevel.Internal,
            capabilities: new CapabilityBag(),
            principal
        };
    }

    /**
     * Promotes an internal context to a command context with write authority.
     */
    static promoteToCommand(ctx: InternalCtx): CommandCtx {
        return {
            traceId: ctx.traceId,
            trustLevel: TrustLevel.Command,
            capabilities: new CapabilityBag([CommitCap.createInternal()]),
            principal: ctx.principal
        };
    }

    /**
     * Elevates a context to system level with full authority.
     */
    static elevateToSystem(ctx: InternalCtx): SystemCtx {
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
}
