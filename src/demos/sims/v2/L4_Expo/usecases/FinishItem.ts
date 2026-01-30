import { CommandUseCase, UnitOfWorkPort } from '../../../../../core';
import { FinishItemComponent, FinishItemInput } from './FinishItemComponent';
import { FinishItemPolicy } from '../domain/FinishItemPolicy';

export class FinishItem extends CommandUseCase<FinishItemInput, void> {
    private component: FinishItemComponent;

    constructor(repo: any, policy: FinishItemPolicy, uowPort: UnitOfWorkPort) {
        super(uowPort);
        this.component = new FinishItemComponent(repo, policy);
    }

    public async run(input: FinishItemInput, principal?: string): Promise<void> {
        return this.executeCommand(this.component, input, principal);
    }
}
