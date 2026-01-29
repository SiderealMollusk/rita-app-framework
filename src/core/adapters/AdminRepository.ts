import { SystemCtx } from '../context/SystemCtx';
import { RawQueryCap } from '../context/capabilities/RawQueryCap';
import { BaseSecondaryAdapter } from './BaseSecondaryAdapter';

/**
 * System-only raw persistence escape hatch.
 */
export abstract class AdminRepository extends BaseSecondaryAdapter {
    /**
     * Raw query execution. Highly privileged.
     */
    protected async executeRaw<T>(ctx: SystemCtx, query: string, params: any[] = []): Promise<T> {
        ctx.capabilities.require(RawQueryCap);
        return this.safeExecute(ctx, 'rawQuery', () => this._doExecuteRaw<T>(ctx, query, params));
    }

    protected abstract _doExecuteRaw<T>(ctx: SystemCtx, query: string, params: any[]): Promise<T>;
}
