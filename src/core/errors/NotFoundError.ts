import { KernelError } from './KernelError';

export class NotFoundError extends KernelError {
    constructor(resource: string, id: string) {
        super(`${resource} with ID ${id} not found`, 'NOT_FOUND_ERROR');
    }
}
