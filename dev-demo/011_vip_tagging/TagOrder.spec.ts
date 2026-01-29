import { TagOrder } from './TagOrder';
import { UserGateway } from './UserGateway';
import { OrderRepository } from './OrderRepository';
import { PriorityPolicy } from './PriorityPolicy';
import { RitaCtx } from '../../src/system/RitaCtx';
import { InMemoryCommitScope } from '../../src/system/persistence/InMemoryCommitScope';

// Mocks
jest.mock('./UserGateway');
jest.mock('./OrderRepository');
jest.mock('./PriorityPolicy');
jest.mock('../../src/system/telemetry/Tracer', () => ({
    Tracer: {
        startSpan: jest.fn().mockReturnValue({
            traceId: 'test-trace',
            end: jest.fn(),
            recordException: jest.fn()
        })
    }
}));
jest.mock('../../src/system/telemetry/Logger');

describe('TagOrder (CQRS)', () => {
    let mockCtx: RitaCtx;
    let userGateway: jest.Mocked<UserGateway>;
    let orderRepo: jest.Mocked<OrderRepository>;
    let policy: jest.Mocked<PriorityPolicy>;
    let command: TagOrder;

    beforeEach(() => {
        // Setup CQRS Context
        mockCtx = {
            traceId: 'test-trace',
            // Provide a real commit implementation or a mock that executes the fn
            commit: jest.fn(async (fn) => {
                const scope = new InMemoryCommitScope();
                await fn(scope);
            })
        };

        userGateway = new UserGateway() as jest.Mocked<UserGateway>;
        orderRepo = new OrderRepository() as jest.Mocked<OrderRepository>;
        policy = new PriorityPolicy() as jest.Mocked<PriorityPolicy>;

        // Setup successful mocks
        userGateway.getUser.mockResolvedValue({ userId: 'u1', tier: 'STD' });
        policy.execute.mockImplementation((_ctx, order, _profile) => order); // Identity

        command = new TagOrder(userGateway, orderRepo, policy);

    });

    it('should Execute, Commit, and Persist', async () => {
        const input = { orderId: 'o1', userId: 'u1', amount: 100 };

        await command.execute(mockCtx, input);

        // Verify Gateway Called
        expect(userGateway.getUser).toHaveBeenCalledWith(expect.anything(), 'u1');

        // Verify Policy Called
        expect(policy.execute).toHaveBeenCalled();

        // Verify Commit & Save
        expect(mockCtx.commit).toHaveBeenCalled(); // The Command triggered a commit
        expect(orderRepo.saveIfChanged).toHaveBeenCalled(); // The Repo was called inside commit
    });
});
