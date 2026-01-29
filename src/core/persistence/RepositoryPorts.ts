
import { CommitScope } from './CommitScope';

/**
 * Standard Read Port.
 * 
 * Reads do NOT require a CommitScope.
 * They return DTOs or Entities (readonly).
 */
export interface Reader<T> {
    findById(id: string): Promise<T | null>;
}

/**
 * Standard Write Port.
 * 
 * Writes REQUIRE a CommitScope (transaction token).
 * This enforces that you cannot write unless you are in a Command with an open transaction.
 */
export interface Writer<T> {
    /**
     * Optimistic Concurrency Save.
     * 
     * @param scope The proof that we are in a valid transaction.
     * @param previous The version we read (for OCC check). undefined if new.
     * @param next The new state to save.
     */
    saveIfChanged(scope: CommitScope, previous: T | undefined, next: T): Promise<void>;
}

