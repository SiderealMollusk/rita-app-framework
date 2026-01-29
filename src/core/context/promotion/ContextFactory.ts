import { v4 as uuidv4 } from 'uuid';
import { TrustLevel } from '../BaseCtx';
import { CapabilityBag } from '../CapabilityBag';
import { ExternalCtx } from '../ExternalCtx';
import { InternalCtx } from '../InternalCtx';
import { CommandCtx } from '../CommandCtx';
import { SystemCtx } from '../SystemCtx';
import { promoteExternalToInternal } from './promoteExternalToInternal';
import { promoteInternalToCommand } from './promoteInternalToCommand';
import { promoteToSystem } from './promoteToSystem';

export { promoteExternalToInternal } from './promoteExternalToInternal';
export { promoteInternalToCommand } from './promoteInternalToCommand';
export { promoteToSystem } from './promoteToSystem';

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
        return promoteExternalToInternal(ctx, principal);
    }

    /**
     * Promotes an internal context to a command context with write authority.
     */
    static promoteToCommand(ctx: InternalCtx): CommandCtx {
        return promoteInternalToCommand(ctx);
    }

    /**
     * Elevates a context to system level with full authority.
     */
    static promoteToSystem(ctx: InternalCtx): SystemCtx {
        return promoteToSystem(ctx);
    }
}
