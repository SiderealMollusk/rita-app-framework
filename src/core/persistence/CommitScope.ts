
/**
 * The Unit of Work / Write Capability.
 * 
 * This object is ONLY available inside a `ctx.commit()` block.
 * It is the ONLY way to access "Writers" (Repositories that can save).
 * 
 * Design:
 * - It doesn't have methods itself (yet).
 * - It acts as a token/registry that Writers require to persist changes.
 * - In the future, it could hold the transaction handle (e.g. PrismaClient).
 */
export interface CommitScope {
    // For now, it's a marker interface.
    // In valid implementation, this might hold a DB Transaction object.
    readonly _isCommitScope: true;
}

