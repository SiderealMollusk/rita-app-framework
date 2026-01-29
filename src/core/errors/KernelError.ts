/**
 * Base class for all framework-level errors.
 */
export class KernelError extends Error {
    constructor(message: string, public readonly code: string = 'KERNEL_ERROR') {
        super(message);
        this.name = this.constructor.name;
    }
}

export class DomainValidationError extends KernelError {
    constructor(message: string) {
        super(message, 'DOMAIN_VALIDATION_ERROR');
    }
}

export class NotFoundError extends KernelError {
    constructor(resource: string, id: string) {
        super(`${resource} with ID ${id} not found`, 'NOT_FOUND_ERROR');
    }
}

export class BusinessRuleViolationError extends KernelError {
    constructor(message: string) {
        super(message, 'BUSINESS_RULE_VIOLATION');
    }
}

export class UnauthorizedError extends KernelError {
    constructor(message: string = 'Unauthorized') {
        super(message, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends KernelError {
    constructor(message: string = 'Forbidden') {
        super(message, 'FORBIDDEN');
    }
}

export class DependencyFailureError extends KernelError {
    constructor(dependency: string, originalError?: Error) {
        super(`Dependency failure: ${dependency}${originalError ? ` (${originalError.message})` : ''}`, 'DEPENDENCY_FAILURE');
    }
}
