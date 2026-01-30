import { StrictPrimaryAdapter } from '../StrictPrimaryAdapter';
import { UnitOfWorkFactoryPort } from '../../../core/ports/UnitOfWorkFactoryPort';
import { UnitOfWork } from '../../../core/ports/UnitOfWorkPort';
import { OperationScope } from '../../../core/scope/OperationScope';
import { TrustLevel } from '../../../core/context/BaseCtx';

// Concrete implementation for testing
class TestAdapter extends StrictPrimaryAdapter {
    public runQuery(principal: string) {
        return this.createQueryScope(principal);
    }

    public async runCommand(principal: string) {
        return this.createCommandScope(principal);
    }
}

describe('StrictPrimaryAdapter', () => {
    let mockFactory: UnitOfWorkFactoryPort;
    let mockUoW: UnitOfWork;

    beforeEach(() => {
        mockUoW = {
            commit: jest.fn(),
            rollback: jest.fn(),
            close: jest.fn()
        } as any;

        mockFactory = {
            open: jest.fn().mockResolvedValue(mockUoW)
        };
    });

    it('should create a Query scope (Read-Only)', () => {
        const adapter = new TestAdapter(mockFactory);
        const scope = adapter.runQuery('user-1');

        expect(scope).toBeInstanceOf(OperationScope);
        expect(scope.context.trustLevel).toBe(TrustLevel.Internal);
        expect(() => scope.uow).toThrow(); // Should NOT have UoW
    });

    it('should create a Command scope (Read-Write)', async () => {
        const adapter = new TestAdapter(mockFactory);
        const scope = await adapter.runCommand('user-1');

        expect(scope).toBeInstanceOf(OperationScope);
        expect(scope.context.trustLevel).toBe(TrustLevel.Command);
        expect(scope.uow).toBe(mockUoW);
        expect(mockFactory.open).toHaveBeenCalled();
    });
});
