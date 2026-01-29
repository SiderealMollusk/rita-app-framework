
import { BaseComponent } from '../BaseComponent';
import { RitaCtx } from '../RitaCtx';



/**
 * Base Query.
 * 
 * Queries:
 * 1. Read-Only.
 * 2. Return DTOs/Views.
 * 3. MUST NOT access `ctx.commit`.
 */
export abstract class BaseQuery<TInput, TOutput> extends BaseComponent<TInput, TOutput> {

    // Enforce Safety: Override execute to runtime check? 
    // Or just provide no helpers.
    // Let's do a runtime check in _run wrapper if possible, or just rely on 'ctx.commit' being undefined for queries.

    // Ideally, we'd remove 'commit' from the type of 'ctx' passed to _run, but TS makes that hard with inheritance.
    // For now, we trust the runtime setup (BaseInteraction) to NOT provide ctx.commit for Queries.

    protected async _run(ctx: RitaCtx, input: TInput): Promise<TOutput> {
        if (ctx.commit) {
            // In strict mode, we might ban this.
            // throw new AgentGuidanceError("Query Safety Violation: Context has commit capability!");
        }
        return this.executeQueryParams(ctx, input);
    }

    protected abstract executeQueryParams(ctx: RitaCtx, input: TInput): Promise<TOutput>;
}

