import { BehaviorSpec } from '../../src/system/BehaviorSpec';
import { PlaceOrderController } from './PlaceOrderController';
import { OrderRepository } from './OrderRepository';
import { Order } from './Order';
import { Logger } from '../../src/system/telemetry/Logger';

// Mocks
jest.mock('../../src/system/telemetry/Logger');

BehaviorSpec.feature('Place Order', () => {

    // Setup
    let controller: PlaceOrderController;
    let repo: OrderRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repo = new OrderRepository();
        controller = new PlaceOrderController(repo);
    });

    BehaviorSpec.scenario('Customer places a valid VIP order', () => {
        BehaviorSpec.given('the order amount is > 1000', async () => {
            const input = {
                id: 'order-123',
                amount: 1500,
                customerId: 'cust-1'
            };

            const result = await controller.run(input);

            // Expect successful result
            expect(result.status).toBe('VIP');
            expect(result.id).toBe('order-123');

            // Verify Gateway was called (Side Effect)
            // (In a real test we'd mock the repo save method)
        });
    });

    BehaviorSpec.scenario('Customer places a valid small order', () => {
        BehaviorSpec.given('the order amount is < 1000', async () => {
            const input = {
                id: 'order-456',
                amount: 50,
                customerId: 'cust-2'
            };

            const result = await controller.run(input);

            expect(result.status).toBe('PENDING');
        });
    });

    BehaviorSpec.scenario('Order rejected due to invalid qty/amount', () => {
        BehaviorSpec.given('amount is negative', async () => {
            const input = {
                id: 'order-bad',
                amount: -100,
                customerId: 'cust-bad'
            };
            // Assuming policy throws or returns error state
            // Here we assume it throws for simplicity of the PoC
            await expect(controller.run(input)).rejects.toThrow("Amount must be positive");
        });
    });
});
