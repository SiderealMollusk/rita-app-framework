import { ZodSchema } from 'zod';
import { OperationScope } from '../../core/scope/OperationScope';
import { Tracer } from '../../core/telemetry/Tracer';
import { Strict } from './types';

/**
 * StrictUseCase enforces schema validation for inputs and outputs,
 * and requires an OperationScope for execution.
 */
export abstract class StrictUseCase<TInput, TOutput> implements Strict {
    public readonly _strictVersion = 1;

    /**
     * Zod schema for the incoming request.
     */
    protected abstract get requestSchema(): ZodSchema<TInput>;

    /**
     * Zod schema for the outgoing response.
     */
    protected abstract get responseSchema(): ZodSchema<TOutput>;

    /**
     * Main entry point for the Use Case.
     * Enforces validation and tracing.
     */
    public async run(scope: OperationScope, rawInput: unknown): Promise<TOutput> {
        const span = Tracer.startSpan(`[Strict UseCase] ${this.constructor.name}`, scope.context);
        try {
            // Validate In
            const input = this.requestSchema.parse(rawInput);

            // Execute
            const output = await this.onExecute(scope, input);

            // Validate Out
            const cleanOutput = this.responseSchema.parse(output);

            return cleanOutput;
        } catch (e: any) {
            span.recordException(e);
            throw e;
        } finally {
            span.end();
        }
    }

    /**
     * Inner execution logic to be implemented by subclasses.
     */
    protected abstract onExecute(scope: OperationScope, input: TInput): Promise<TOutput>;
}
