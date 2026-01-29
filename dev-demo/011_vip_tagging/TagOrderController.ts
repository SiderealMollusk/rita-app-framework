import { CommandInteraction } from '../../src/system/BaseInteraction';
import { TagOrder } from './TagOrder';
import { UserGateway } from './UserGateway';
import { OrderRepository } from './OrderRepository';

type RequestDTO = {
    orderId: string;
    userId: string;
    amount: number;
};

export class TagOrderController extends CommandInteraction<RequestDTO, any> {

    private useCase: TagOrder;

    // We allow passing gateways for easy testing/wiring
    constructor(
        userGateway: UserGateway = new UserGateway(),
        orderRepo: OrderRepository = new OrderRepository()
    ) {
        super();
        this.useCase = new TagOrder(userGateway, orderRepo);
    }

    public async run(input: RequestDTO): Promise<any> {
        // Validation (Imperative Shell)
        if (!input.userId) throw new Error("Missing userId");

        // Execution
        const order = await this.executeUseCase(this.useCase, input);

        // Response Mapping
        return {
            orderId: order.id,
            finalPriority: order.priority,
            note: order._provenance.history // Expose audit log for demo!
        };
    }
}
