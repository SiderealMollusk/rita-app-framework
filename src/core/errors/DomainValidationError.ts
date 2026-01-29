import { KernelError } from './KernelError';

export class DomainValidationError extends KernelError {
    constructor(message: string) {
        super(message, 'DOMAIN_VALIDATION_ERROR');
    }
}
