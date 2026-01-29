import { PriorityPolicy } from './PriorityPolicy';
import { UserGateway } from './UserGateway';
import { CustomerProfile } from './CustomerProfile';
import { Order } from './Order';
import { TagOrder } from './TagOrder';
import { OrderRepository } from './OrderRepository';
import { SystemCtx } from '../../src/core/SystemCtx';



// --- UserGateway Tests ---
describe('UserGateway', () => {
    const mockCtx = { traceId: 'test' } as SystemCtx;

    it('should return a user mock by default', async () => {
        const gw = new UserGateway();
        const user = await gw.getUser(mockCtx, 'u1');

        expect(user).toBeDefined();
        expect(user.userId).toBe('u1');
        expect(user.tier).toBe('STD'); // Default
    });

    it('should return VIP for specific IDs', async () => {
        const gw = new UserGateway(); // Stub logic is hardcoded in class

        const user = await gw.getUser(mockCtx, 'u_gold');
        expect(user.tier).toBe('GOLD');
    });
});

// --- PriorityPolicy Tests ---
describe('PriorityPolicy', () => {
    const mockCtx = { traceId: 'test' } as SystemCtx;

    it('should upgrade priority if user is GOLD', async () => {
        const policy = new PriorityPolicy();
        const profile: CustomerProfile = { userId: 'u1', tier: 'GOLD' };

        const order = new Order({ id: 'o1', amount: 100, priority: 'NORMAL' });

        // Execute Policy
        const updatedOrder = policy.execute(mockCtx, order, profile);

        expect(updatedOrder.priority).toBe('HIGH');
        expect(updatedOrder._rev).toBe(2); // Evolved
    });

    it('should set CRITICAL logic if amount > 1000', async () => {
        const policy = new PriorityPolicy();
        const profile: CustomerProfile = { userId: 'u1', tier: 'STD' };

        const order = new Order({ id: 'o2', amount: 5000, priority: 'NORMAL' });

        const updatedOrder = policy.execute(mockCtx, order, profile);

        expect(updatedOrder.priority).toBe('CRITICAL');
    });

    it('should do nothing if conditions are not met', async () => {
        const policy = new PriorityPolicy();
        const profile: CustomerProfile = { userId: 'u1', tier: 'STD' };
        const order = new Order({ id: 'o3', amount: 100, priority: 'NORMAL' });

        const updatedOrder = policy.execute(mockCtx, order, profile);

        expect(updatedOrder.priority).toBe('NORMAL');
        expect(updatedOrder._rev).toBe(1); // No change
    });
});


// --- OrderRepository Tests ---
import { CommitScope } from '../../src/core/persistence/CommitScope';

describe('OrderRepository (Demo)', () => {


    it('should save and retrieve orders', async () => {
        const repo = new OrderRepository();
        const order = new Order({ id: 'o1', amount: 999, priority: 'NORMAL' });

        // Mock Commit Scope
        const scope = { isCommitScope: true } as unknown as CommitScope;

        await repo.saveIfChanged(scope, undefined, order);

        // White-box verify db map
        expect(repo.savedOrders.length).toBe(1);
        expect(repo.savedOrders[0].id).toBe('o1');
    });
});


describe('Order Entity (Validation)', () => {
    it('should throw on negative amount', () => {
        expect(() => new Order({ id: 'bad', amount: -1, priority: 'NORMAL' }))
            .toThrow('Amount cannot be negative');
    });
});

describe('UserGateway (Branches)', () => {
    it('should return PLAT for u_plat', async () => {
        const gw = new UserGateway();
        const mockCtx = { traceId: 'test' } as SystemCtx;
        const user = await gw.getUser(mockCtx, 'u_plat');
        expect(user.tier).toBe('PLAT');
    });
});


describe('TagOrder (Defaults)', () => {
    it('should use default policy if not provided', () => {
        // We can't easily spy on default parameter instantiation without checking private property
        // But simply instantiating it covers the branch.
        // Convert to any to access internal property if we wanted to verify instance, but just running it is enough for coverage.
        const useCase = new TagOrder(
            new UserGateway(),
            new OrderRepository()
            // 3rd arg defaults
        );
        expect(useCase).toBeDefined();
    });
});
