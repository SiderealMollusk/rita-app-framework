import { CommandUseCase, UnitOfWorkPort, EventBusPort } from '../../../../../core';
import { CompleteItemComponent, CompleteItemInput } from './CompleteItemComponent';
import { KitchenPolicy } from '../domain/KitchenPolicy';

export class CompleteItem extends CommandUseCase<CompleteItemInput, void> {
    private component: CompleteItemComponent;

    constructor(repo: any, policy: KitchenPolicy, uowPort: UnitOfWorkPort, eventBus?: EventBusPort) {
        super(uowPort);
        this.component = new CompleteItemComponent(repo, policy, eventBus);
    }

    public async run(input: CompleteItemInput, principal?: string): Promise<void> {
        return this.executeCommand(this.component, input, principal);
    }
}
