import { BaseInteraction } from '../../src/system/BaseInteraction';
import { OrderRepository } from './OrderRepository';
import { Order } from './Order';


import { CommandInteraction } from '../../src/system/BaseInteraction';
import { PlaceOrder, PlaceOrderInput } from './PlaceOrder';

export class PlaceOrderController extends CommandInteraction<PlaceOrderInput, any> {
    private useCase: PlaceOrder;

    constructor(repo: OrderRepository) {
        super();
        this.useCase = new PlaceOrder(repo);
    }

    public async run(input: PlaceOrderInput): Promise<any> {
        // In a real controller, we'd validate the JSON schema here

        const order = await this.executeUseCase(this.useCase, input);

        return {
            id: order.id,
            status: order.status,
            amount: order.amount
        };
    }
}

