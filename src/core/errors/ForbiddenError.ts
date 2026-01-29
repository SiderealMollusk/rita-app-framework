import { KernelError } from './KernelError';

export class ForbiddenError extends KernelError {
    constructor(message: string = 'Forbidden') {
        super(message, 'FORBIDDEN');
    }
}
