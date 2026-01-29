import { KernelError } from './KernelError';

export class DependencyFailureError extends KernelError {
    constructor(dependency: string, originalError?: Error) {
        super(`Dependency failure: ${dependency}${originalError ? ` (${originalError.message})` : ''}`, 'DEPENDENCY_FAILURE');
    }
}
