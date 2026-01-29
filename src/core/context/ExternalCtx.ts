import { BaseCtx, TrustLevel } from './BaseCtx';
import { CapabilityBag } from './CapabilityBag';

/**
 * Represents untrusted input from the outside world.
 */
export interface ExternalCtx extends BaseCtx {
    readonly trustLevel: TrustLevel.External;
}
