import { KernelError } from './KernelError';

export class UnauthorizedError extends KernelError {
    constructor(message: string = 'Unauthorized') {
        super(message, 'UNAUTHORIZED');
    }
}
