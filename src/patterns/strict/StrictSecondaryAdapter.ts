import { ZodSchema } from 'zod';
import { BaseSecondaryAdapter } from '../../core/adapters/BaseSecondaryAdapter';
import { OperationScope } from '../../core/scope/OperationScope';
import { Strict } from './types';

/**
 * StrictSecondaryAdapter enforces outbound schema validation and
 * ensures trace propagation to external systems.
 */
export abstract class StrictSecondaryAdapter<TInput, TOutput>
    extends BaseSecondaryAdapter implements Strict {

    public readonly _strictVersion = 1;

    /**
     * Zod schema for outbound data.
     */
    protected abstract get outboundSchema(): ZodSchema<TInput>;

    /**
     * Executes an outbound call with validation and tracing.
     */
    public async call(scope: OperationScope, input: TInput): Promise<TOutput> {
        // 1. Validate Outbound
        const cleanInput = this.outboundSchema.parse(input);

        // 2. Prepare headers/context for propagation
        const propagationHeaders = {
            'x-trace-id': scope.context.traceId,
            'x-principal': scope.context.principal || 'unknown'
        };

        // 3. Execute via safeExecute
        return this.safeExecute(scope.context, 'call', () =>
            this.onCall(cleanInput, propagationHeaders)
        );
    }

    /**
     * Inner call logic to be implemented by subclasses.
     */
    protected abstract onCall(input: TInput, headers: Record<string, string>): Promise<TOutput>;
}
