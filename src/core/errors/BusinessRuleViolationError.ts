import { KernelError } from './KernelError';

export class BusinessRuleViolationError extends KernelError {
    constructor(message: string) {
        super(message, 'BUSINESS_RULE_VIOLATION');
    }
}
