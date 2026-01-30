import { CommandUseCase, UnitOfWorkPort, IdGeneratorPort } from '../../../../../core';
import { PlaceOrderComponent, PlaceOrderInput } from './PlaceOrderComponent';

export class PlaceOrder extends CommandUseCase<PlaceOrderInput, string> {
    private component: PlaceOrderComponent;

    constructor(repo: any, uowPort: UnitOfWorkPort, idGen: IdGeneratorPort) {
        super(uowPort);
        this.component = new PlaceOrderComponent(repo, idGen);
    }

    public async run(input: PlaceOrderInput): Promise<string> {
        return this.executeCommand(this.component, input);
    }
}
