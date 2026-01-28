import { BehaviorSpec } from '../../src/system/BehaviorSpec';
import { TagOrderController } from './TagOrderController';
import { UserGateway } from './UserGateway';
import { OrderRepository } from './OrderRepository';

// Real (Stub) implementations, NOT Mocks!
// This proves the "stub adapter" pattern works.

BehaviorSpec.feature('Context-Aware Priority Tagging', () => {

    let controller: TagOrderController;

    beforeEach(() => {
        // Real Wiring
        controller = new TagOrderController(new UserGateway(), new OrderRepository());
    });

    BehaviorSpec.scenario('Gold User gets Priority', () => {
        BehaviorSpec.given('User is GOLD and Order is Small', async () => {
            const result = await controller.run({
                orderId: 'o1',
                userId: 'u_gold', // Stub returns GOLD for this ID
                amount: 50
            });

            expect(result.finalPriority).toBe('HIGH');
            // Check the Audit Log (Provenance)
            expect(result.note.some((n: string) => n.includes('User is GOLD Tier'))).toBe(true);
        });
    });

    BehaviorSpec.scenario('High Value Order gets Critical Priority', () => {
        BehaviorSpec.given('User is STD but Order is > 1000', async () => {
            const result = await controller.run({
                orderId: 'o2',
                userId: 'u_std', // Stub returns STD
                amount: 1500
            });

            expect(result.finalPriority).toBe('CRITICAL');
            expect(result.note.some((n: string) => n.includes('Order Value > 1000'))).toBe(true);
        });
    });

    BehaviorSpec.scenario('Standard User gets Standard Priority', () => {
        BehaviorSpec.given('User is STD and Order is Small', async () => {
            const result = await controller.run({
                orderId: 'o3',
                userId: 'u_std',
                amount: 100
            });

            expect(result.finalPriority).toBe('NORMAL');
        });
    });
});
