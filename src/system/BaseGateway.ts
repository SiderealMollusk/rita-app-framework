import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';

/**
 * The Outbound Boundary (Adapter/Repository/Client).
 * 
 * Agents must extend this to talk to the outside world.
 * It provides a "Safety Net" for external calls.
 * 
 * Rules:
 * 1. Must implement Abstract Ports defined in the Domain.
 * 2. Must wrap external calls in `safeExecute`.
 */
export abstract class BaseGateway {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    /**
     * Safe Execution Wrapper for External Calls (Side Effects).
     * 
     * @param ctx The explicit Request Context
     * @param operationName Name of the external operation (e.g. "dynamo.putItem")
     * @param fn The async function performing the side effect
     */
    protected async safeExecute<T>(ctx: RitaCtx, operationName: string, fn: () => Promise<T>): Promise<T> {
        const span = Tracer.startSpan(`[Gateway] ${this.name}:${operationName}`, ctx);

        try {
            Logger.debug(`[Gateway] ${this.name} calling ${operationName}...`, {
                traceId: span.traceId
            });

            const result = await fn();

            Logger.debug(`[Gateway] ${this.name}:${operationName} succeeded`, {
                traceId: span.traceId
            });
            span.end();
            return result;

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            Logger.error(`[Gateway] ${this.name}:${operationName} FAILED`, {
                error: errorMessage,
                traceId: span.traceId
            });
            span.recordException(err instanceof Error ? err : new Error(errorMessage));
            span.end();
            throw err;
        }

    }
}

// TODO(P1): Consider allowing safeExecute to accept operation metadata (e.g., retry policy) later; punt for now.

