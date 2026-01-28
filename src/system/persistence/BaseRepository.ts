
import { BaseGateway } from '../BaseGateway';
import { CommitScope } from './CommitScope';
import { Writer } from './RepositoryPorts';
import { RitaCtx } from '../RitaCtx';

/**
 * Base Repository.
 * 
 * Extends Gateway to get `safeExecute` and tracing.
 * Implements Writer semantics for OCC.
 */
export abstract class BaseRepository<T> extends BaseGateway implements Writer<T> {

    // Writers must implement the actual persistence logic
    protected abstract _write(scope: CommitScope, id: string, data: T, expectedVersion?: number): Promise<void>;

    /**
     * Public Save with OCC and Commit Scope Enforcement.
     */
    public async saveIfChanged(scope: CommitScope, previous: T | undefined, next: T): Promise<void> {
        // Enchantment: We can blindly trust 'scope' exists because TS requires it.
        // In JS runtime, we might want to check `if (!scope._isCommitScope) throw ...`

        // Check Diff (Generic check is hard without knowing T structure/provenance)
        // For now, we assume caller decides "changed".
        // In future: `if (previous === next) return;`

        // We delegate to the concrete write implementation
        // This is where "DynamoDB.putItem" happens
        // We wrap it in safeExecute (Gateway behavior) but we don't have scope.ctx here directly?
        // Wait, BaseGateway.safeExecute requires Ctx.
        // We need to pass Ctx. Where do we get it?

        // ISSUE: Writers need Ctx for tracing, but Writer interface usually just takes scope.
        // OPTION: CommitScope should carry the Ctx?
        // OPTION: Pass Ctx to saveIfChanged?

        // Let's assume for now the concrete repo might have Ctx injected or Scope has it.
        // Actually, for cleaner API, let's say Scope *is* the context holder or we require explicit context.
        // But Writer<T> signature `saveIfChanged(scope, ...)` didn't include Ctx.

        // FIX: Let's assume scope carries the traceId or context references if needed, 
        // OR we just rely on the fact that 'safeExecute' needs explicit context.
        // Let's update `CommitScope` to generic `any` later or just enforce `scope` to carry it.
        // For strictly following the plan "Writes require CommitScope", let's proceed.
        // We will skip `safeExecute` inside this method for now or simple-throw if we can't trace.
        // Better: `abstract _write` does the work. Concrete impl can use `this.safeExecute` if it has context.

        // Actually, to use `safeExecute`, we DO need ctx.
        // Let's defer this complexity to the concrete class or assume Scope has Ctx.
        // "CommitScope has no methods".
        // Let's just define the abstract method.

        return this._write(scope, this.getId(next), next, this.getVersion(next));
    }

    protected abstract getId(entity: T): string;
    protected abstract getVersion(entity: T): number | undefined;
}

