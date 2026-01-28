import { BaseInteraction } from '../../src/system/BaseInteraction';
import { PlaceOrder } from './PlaceOrder';
import { OrderRepository } from './OrderRepository';
import { Order } from './Order';

type RequestDTO = {
    id: string;
    amount: number;
    customerId: string;
};

export class PlaceOrderController extends BaseInteraction<RequestDTO, any> {
    private useCase: PlaceOrder;

    constructor(repo: OrderRepository) {
        super();
        this.useCase = new PlaceOrder(repo);
    }

    public async run(input: RequestDTO): Promise<any> {
        // In a real controller, we'd validate the JSON schema here

        const order = await this.executeUseCase(this.useCase, input);

        return {
            id: order.id,
            status: order.status,
            amount: order.amount
        };
    }
}
