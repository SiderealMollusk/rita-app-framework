import { OrderRepository } from './OrderRepository';



import { CommandInteraction } from '../../src/system/BaseInteraction';
import { PlaceOrder, PlaceOrderInput } from './PlaceOrder';

export class PlaceOrderController extends CommandInteraction<PlaceOrderInput, PlaceOrderResponse> {

    private useCase: PlaceOrder;

    constructor(repo: OrderRepository) {
        super();
        this.useCase = new PlaceOrder(repo);
    }

    public async run(input: PlaceOrderInput): Promise<PlaceOrderResponse> {
        // In a real controller, we'd validate the JSON schema here

        const order = await this.executeUseCase(this.useCase, input);

        return {
            id: order.id,
            status: order.status,
            amount: order.amount
        };
    }
}

type PlaceOrderResponse = {
    id: string;
    status: string;
    amount: number;
};


