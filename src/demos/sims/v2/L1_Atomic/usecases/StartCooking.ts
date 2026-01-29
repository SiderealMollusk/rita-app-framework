import { CommandUseCase, UnitOfWorkPort } from '../../../../../core';
import { StartCookingComponent, StartCookingInput } from './StartCookingComponent';
import { KitchenPolicy } from '../domain/KitchenPolicy';

export class StartCooking extends CommandUseCase<StartCookingInput, void> {
    private component: StartCookingComponent;

    constructor(repo: any, policy: KitchenPolicy, uowPort: UnitOfWorkPort) {
        super(uowPort);
        this.component = new StartCookingComponent(repo, policy);
    }

    public async run(input: StartCookingInput): Promise<void> {
        return this.executeCommand(this.component, input);
    }
}
