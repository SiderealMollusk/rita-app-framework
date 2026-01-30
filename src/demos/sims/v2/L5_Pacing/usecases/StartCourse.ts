import { CommandUseCase, UnitOfWorkPort } from '../../../../../core';
import { StartCourseComponent, StartCourseInput } from './StartCourseComponent';
import { KitchenPolicy } from '../../L1_Atomic/domain/KitchenPolicy';

export class StartCourse extends CommandUseCase<StartCourseInput, void> {
    private component: StartCourseComponent;

    constructor(repo: any, policy: KitchenPolicy, uowPort: UnitOfWorkPort) {
        super(uowPort);
        this.component = new StartCourseComponent(repo, policy);
    }

    public async run(input: StartCourseInput, principal?: string): Promise<void> {
        return this.executeCommand(this.component, input, principal);
    }
}
