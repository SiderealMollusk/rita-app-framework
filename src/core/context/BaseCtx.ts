import { CapabilityBag } from './CapabilityBag';

export enum TrustLevel {
    External = 'external',
    Internal = 'internal',
    Command = 'command',
    System = 'system'
}

export interface BaseCtx {
    readonly traceId: string;
    readonly trustLevel: TrustLevel;
    readonly capabilities: CapabilityBag;
    readonly principal?: string;
}
