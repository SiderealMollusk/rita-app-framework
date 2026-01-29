/**
 * Base class for all framework-level errors.
 */
export class KernelError extends Error {
    constructor(message: string, public readonly code: string = 'KERNEL_ERROR') {
        super(message);
        this.name = this.constructor.name;
    }
}
