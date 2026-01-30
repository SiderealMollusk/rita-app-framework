import { CommandUseCase, UnitOfWorkPort, ClockPort } from '../../../../../core';
import { StartCookingComponentL3, StartCookingInputL3 } from './StartCookingComponentL3';
import { KitchenPolicy } from '../../L1_Atomic/domain/KitchenPolicy';
import { CompleteItem } from '../../L1_Atomic/usecases/CompleteItem';

export class StartCookingL3 extends CommandUseCase<StartCookingInputL3, void> {
    private component: StartCookingComponentL3;

    constructor(
        repo: any,
        policy: KitchenPolicy,
        uowPort: UnitOfWorkPort,
        clock: ClockPort,
        completeItemUseCase: CompleteItem
    ) {
        super(uowPort);
        this.component = new StartCookingComponentL3(repo, policy, clock, completeItemUseCase);
    }

    public async run(input: StartCookingInputL3, principal?: string): Promise<void> {
        return this.executeCommand(this.component, input, principal);
    }
}
