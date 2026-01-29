import { CommandUseCase } from '../../src/core/BaseUseCase';
import { TagOrder } from './TagOrder';
import { UserGateway } from './UserGateway';
import { OrderRepository } from './OrderRepository';

type RequestDTO = {
    orderId: string;
    userId: string;
    amount: number;
};

export class TagOrderController extends CommandUseCase<RequestDTO, TagOrderResponse> {


    private useCase: TagOrder;

    // We allow passing gateways for easy testing/wiring
    constructor(
        userGateway: UserGateway = new UserGateway(),
        orderRepo: OrderRepository = new OrderRepository()
    ) {
        super();
        this.useCase = new TagOrder(userGateway, orderRepo);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async run(input: RequestDTO): Promise<any> {

        // Validation (Imperative Shell)
        if (!input.userId) throw new Error("Missing userId");

        // Execution
        const order = await this.executeUseCase(this.useCase, input);

        // Response Mapping
        const response: TagOrderResponse = {
            orderId: order.id,
            finalPriority: order.priority,
            note: order._provenance.history // Expose audit log for demo!
        };
        return response;
    }
}

type TagOrderResponse = {
    orderId: string;
    finalPriority: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    note: any[]; // It's a complex history object, keeping as any[] or unknown[] for now is fine, or define HistoryItem type
};



