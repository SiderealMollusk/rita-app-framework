import { CommandUseCase, UnitOfWorkPort, IdGeneratorPort, EventBusPort } from '../../../../../core';
import { PlaceOrderComponentL2, PlaceOrderInputL2 } from './PlaceOrderComponentL2';

export class PlaceOrderL2 extends CommandUseCase<PlaceOrderInputL2, string> {
    private component: PlaceOrderComponentL2;

    constructor(repo: any, uowPort: UnitOfWorkPort, idGen: IdGeneratorPort, eventBus: EventBusPort) {
        super(uowPort);
        this.component = new PlaceOrderComponentL2(repo, idGen, eventBus);
    }

    public async run(input: PlaceOrderInputL2, principal?: string): Promise<string> {
        return this.executeCommand(this.component, input, principal);
    }
}
