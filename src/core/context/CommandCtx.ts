import { BaseCtx, TrustLevel } from './BaseCtx';

/**
 * InternalCtx + write authority.
 */
export interface CommandCtx extends BaseCtx {
    readonly trustLevel: TrustLevel.Command;
}
