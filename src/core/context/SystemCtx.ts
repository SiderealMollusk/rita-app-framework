import { BaseCtx, TrustLevel } from './BaseCtx';

/**
 * Administrative execution.
 */
export interface SystemCtx extends BaseCtx {
    readonly trustLevel: TrustLevel.System;
}
