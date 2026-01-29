import { KernelError } from '../../errors/KernelError';
import { NotFoundError } from '../../errors/NotFoundError';
import { DependencyFailureError } from '../../errors/DependencyFailureError';
import { DomainValidationError } from '../../errors/DomainValidationError';
import { BusinessRuleViolationError } from '../../errors/BusinessRuleViolationError';
import { UnauthorizedError } from '../../errors/UnauthorizedError';
import { ForbiddenError } from '../../errors/ForbiddenError';
import { HexagonLoader } from '../HexagonLoader';
import { HexagonRegistry } from '../HexagonRegistry';
import { HexagonSpec } from '../HexagonSpec';

describe('Hexagon & Errors', () => {
    describe('KernelError hierarchy', () => {
        it('should create kernel errors with codes', () => {
            const err = new KernelError('Something failed', 'FAIL_CODE');
            expect(err.message).toBe('Something failed');
            expect(err.code).toBe('FAIL_CODE');
            expect(err.name).toBe('KernelError');

            const errDefault = new KernelError('Default');
            expect(errDefault.code).toBe('KERNEL_ERROR');
        });

        it('should create specialized errors', () => {
            const nf = new NotFoundError('User', '123');
            expect(nf.message).toBe('User with ID 123 not found');
            expect(nf.code).toBe('NOT_FOUND_ERROR');

            const df = new DependencyFailureError('DB', new Error('timeout'));
            expect(df.message).toContain('Dependency failure: DB (timeout)');

            expect(new DependencyFailureError('DB').message).toBe('Dependency failure: DB');
            expect(new DomainValidationError('bad data').code).toBe('DOMAIN_VALIDATION_ERROR');
            expect(new BusinessRuleViolationError('rule broken').code).toBe('BUSINESS_RULE_VIOLATION');
            expect(new UnauthorizedError().code).toBe('UNAUTHORIZED');
            expect(new ForbiddenError().code).toBe('FORBIDDEN');
        });
    });

    describe('Hexagon Primitives (Structural)', () => {
        const validSpec: HexagonSpec = {
            name: 'Orders',
            version: '1.0.0',
            primaryAdapters: [],
            useCases: [],
            policies: [],
            secondaryPorts: [],
            secondaryAdapters: []
        };

        it('should validate and freeze specs', () => {
            const spec = HexagonLoader.validate(validSpec);
            expect(spec.name).toBe('Orders');
            expect(Object.isFrozen(spec)).toBe(true);
        });

        it('should throw on invalid spec', () => {
            expect(() => HexagonLoader.validate({ ...validSpec, name: '' })).toThrow('name');
            expect(() => HexagonLoader.validate({ ...validSpec, version: '' })).toThrow('version');
        });

        it('should register and retrieve specs', () => {
            HexagonRegistry.clear();
            HexagonRegistry.register(validSpec);
            expect(HexagonRegistry.get('Orders')).toBe(validSpec);
            expect(HexagonRegistry.get('NonExistent')).toBeUndefined();
        });
    });
});
