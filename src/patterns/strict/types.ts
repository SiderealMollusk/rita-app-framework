/**
 * Marker interface for all Strict types.
 */
export interface Strict {
    readonly _strictVersion: 1;
}

/**
 * Type guard to check if an object is Strict.
 */
export function isStrict(obj: any): obj is Strict {
    return obj && obj._strictVersion === 1;
}
