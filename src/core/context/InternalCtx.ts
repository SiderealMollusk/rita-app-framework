import { BaseCtx, TrustLevel } from './BaseCtx';

/**
 * Represents trusted, deterministic execution.
 */
export interface InternalCtx extends BaseCtx {
    readonly trustLevel: TrustLevel.Internal;
}
