import { OrderRepository } from './OrderRepository';



import { CommandUseCase } from '../../src/core/BaseUseCase';
import { PlaceOrder, PlaceOrderInput } from './PlaceOrder';

export class PlaceOrderController extends CommandUseCase<PlaceOrderInput, PlaceOrderResponse> {

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

export type PlaceOrderResponse = {
    id: string;
    status: string;
    amount: number;
};



