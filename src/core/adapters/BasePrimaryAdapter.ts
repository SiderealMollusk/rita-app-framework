import { PrimaryPort } from '../ports/PrimaryPort';
import { ExternalCtx } from '../context/ExternalCtx';
import { ContextFactory } from '../context/promotion/ContextFactory';

/**
 * Base class for all inbound boundaries (HTTP, CLI, Events).
 *
 * Responsibilities:
 * - Parse and Validate input
 * - Authenticate and Create Context
 * - Invoke Use Cases
 */
export abstract class BasePrimaryAdapter implements PrimaryPort {
    protected readonly name: string;

    constructor() {
        this.name = this.constructor.name;
    }

    /**
     * Initial entry point for any external request.
     */
    protected createExternalCtx(traceId?: string): ExternalCtx {
        return ContextFactory.createExternal(traceId);
    }
}
