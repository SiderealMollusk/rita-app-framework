import { OperationScope } from '../OperationScope';
import { InternalCtx } from '../../context/InternalCtx';
import { TrustLevel } from '../../context/BaseCtx';
import { DecisionPolicy } from '../../domain/DecisionPolicy';
import { PolicyToken } from '../../domain/PolicyToken';
import { Tracer } from '../../telemetry/Tracer';

describe('OperationScope', () => {
    const mockCtx: InternalCtx = {
        traceId: 'test-trace',
        trustLevel: TrustLevel.Internal,
        capabilities: {
            has: jest.fn(),
            require: jest.fn()
        } as any
    };

    it('should create a scope', () => {
        const scope = OperationScope.create(mockCtx);
        expect(scope.context).toBe(mockCtx);
        expect(scope.services).toEqual({});
    });

    it('should fork a scope', () => {
        const scope = OperationScope.create(mockCtx);
        const forkName = 'sub-op';

        const forkScope = scope.fork(forkName);

        expect(forkScope.context.traceId).toBe(mockCtx.traceId);
        expect(forkScope.services).toBe(scope.services);
    });

    it('should authorize a policy action', () => {
        const scope = OperationScope.create(mockCtx);
        const mockPolicy = {} as DecisionPolicy<any, any>;
        const action = jest.fn((token) => {
            expect(PolicyToken.isAuthorized(token)).toBe(true);
            return 'success';
        });

        const result = scope.authorize(mockPolicy, action);

        expect(result).toBe('success');
        expect(action).toHaveBeenCalled();
    });
});
