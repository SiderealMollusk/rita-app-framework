import { CommandUseCase, UnitOfWorkPort } from '../../../../../core';
import { PlaceOrderComponent, PlaceOrderInput } from './PlaceOrderComponent';

export class PlaceOrder extends CommandUseCase<PlaceOrderInput, string> {
    private component: PlaceOrderComponent;

    constructor(repo: any, uowPort: UnitOfWorkPort) {
        super(uowPort);
        this.component = new PlaceOrderComponent(repo);
    }

    public async run(input: PlaceOrderInput): Promise<string> {
        return this.executeCommand(this.component, input);
    }
}
