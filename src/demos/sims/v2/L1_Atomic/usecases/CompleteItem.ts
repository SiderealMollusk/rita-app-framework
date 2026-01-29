import { CommandUseCase, UnitOfWorkPort } from '../../../../../core';
import { CompleteItemComponent, CompleteItemInput } from './CompleteItemComponent';
import { KitchenPolicy } from '../domain/KitchenPolicy';

export class CompleteItem extends CommandUseCase<CompleteItemInput, void> {
    private component: CompleteItemComponent;

    constructor(repo: any, policy: KitchenPolicy, uowPort: UnitOfWorkPort) {
        super(uowPort);
        this.component = new CompleteItemComponent(repo, policy);
    }

    public async run(input: CompleteItemInput): Promise<void> {
        return this.executeCommand(this.component, input);
    }
}
