
import { BaseSecondaryAdapter } from '../BaseSecondaryAdapter';
import { CommitScope } from './CommitScope';
import { Writer } from './RepositoryPorts';



/**
 * Base Repository.
 * 
 * Extends SecondaryAdapter to get `safeExecute` and tracing.
 * Implements Writer semantics for OCC.
 */
export abstract class BaseRepository<T> extends BaseSecondaryAdapter implements Writer<T> {

    // Writers must implement the actual persistence logic
    protected abstract _write(scope: CommitScope, id: string, data: T, expectedVersion?: number): Promise<void>;

    /**
     * Public Save with OCC and Commit Scope Enforcement.
     */
    public async saveIfChanged(scope: CommitScope, previous: T | undefined, next: T): Promise<void> {
        // We delegate to the concrete write implementation
        // This is where persistence happens (e.g. DynamoDB.putItem)
        return this._write(scope, this.getId(next), next, this.getVersion(next));
    }

    protected abstract getId(entity: T): string;
    protected abstract getVersion(entity: T): number | undefined;
}
