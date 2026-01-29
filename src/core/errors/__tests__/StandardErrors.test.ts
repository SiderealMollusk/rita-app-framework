import { KernelError } from '../KernelError';
import { DomainValidationError } from '../DomainValidationError';
import { NotFoundError } from '../NotFoundError';
import { BusinessRuleViolationError } from '../BusinessRuleViolationError';
import { UnauthorizedError } from '../UnauthorizedError';
import { ForbiddenError } from '../ForbiddenError';
import { DependencyFailureError } from '../DependencyFailureError';

describe('Standard Errors', () => {
    it('DomainValidationError should have correct properties', () => {
        const err = new DomainValidationError('invalid');
        expect(err.message).toBe('invalid');
        expect(err.code).toBe('DOMAIN_VALIDATION_ERROR');
        expect(err.name).toBe('DomainValidationError');
        expect(err).toBeInstanceOf(KernelError);
    });

    it('NotFoundError should have correct properties', () => {
        const err = new NotFoundError('User', '123');
        expect(err.message).toBe('User with ID 123 not found');
        expect(err.code).toBe('NOT_FOUND_ERROR');
    });

    it('BusinessRuleViolationError should have correct properties', () => {
        const err = new BusinessRuleViolationError('violation');
        expect(err.message).toBe('violation');
        expect(err.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('UnauthorizedError should have correct properties', () => {
        const err = new UnauthorizedError();
        expect(err.message).toBe('Unauthorized');
        expect(err.code).toBe('UNAUTHORIZED');
    });

    it('ForbiddenError should have correct properties', () => {
        const err = new ForbiddenError('No access');
        expect(err.message).toBe('No access');
        expect(err.code).toBe('FORBIDDEN');
    });

    it('ForbiddenError should use default message', () => {
        const err = new ForbiddenError();
        expect(err.message).toBe('Forbidden');
    });

    it('KernelError should use default code', () => {
        const err = new KernelError('msg');
        expect(err.code).toBe('KERNEL_ERROR');
    });

    it('DependencyFailureError should have correct properties', () => {
        const err = new DependencyFailureError('Database', new Error('conn refused'));
        expect(err.message).toBe('Dependency failure: Database (conn refused)');
        expect(err.code).toBe('DEPENDENCY_FAILURE');
    });

    it('DependencyFailureError should work without original error', () => {
        const err = new DependencyFailureError('Service');
        expect(err.message).toBe('Dependency failure: Service');
    });
});
