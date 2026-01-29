import { TagOrderController } from './TagOrderController';
import { TagOrder } from './TagOrder';

// Mock Use Case
jest.mock('./TagOrder');

describe('TagOrderController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should instantiate with default dependencies', () => {
        const controller = new TagOrderController();
        expect(controller).toBeDefined();
    });

    it('should throw if userId is missing', async () => {
        const controller = new TagOrderController();
        const input = { orderId: '123' } as any; // missing userId

        await expect(controller.run(input)).rejects.toThrow('Missing userId');
    });

    it('should execute use case and map response', async () => {
        const controller = new TagOrderController();

        // Mock Use Case result
        const mockOrder = {
            id: 'order-123',
            priority: 'VIP',
            _provenance: { history: ['event1'] }
        };

        // We need to spy on 'executeUseCase' because it's protected/inherited
        // But simpler: Just verify executeUseCase delegates to this.useCase
        // Since we mocked TagOrder, we can check if it was instantiated.
        // And we can mock the executeUseCase method of the controller (partial mock)
        // OR rely on BaseInteraction acting correctly (tested elsewhere)

        // Let's mock the internal useCase.execute call? NO, executeUseCase logic is in Base.

        // Valid Approach: Mock `executeUseCase` on the controller instance.
        const executeSpy = jest.spyOn(controller as any, 'executeUseCase')
            .mockResolvedValue(mockOrder);

        const input = { orderId: '123', userId: 'user-456', amount: 5000 };
        const result = await controller.run(input);

        expect(executeSpy).toHaveBeenCalled();
        expect(result).toEqual({
            orderId: 'order-123',
            finalPriority: 'VIP',
            note: ['event1']
        });
    });
});
