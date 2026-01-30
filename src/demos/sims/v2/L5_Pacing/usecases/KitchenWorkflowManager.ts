import { BaseProcessManager, BaseCtx, CommandCtx, ContextFactory, DomainEvent } from '../../../../../core';
import { StartCourse } from '../usecases/StartCourse';

export class KitchenWorkflowManager extends BaseProcessManager<DomainEvent> {
    constructor(
        private repo: any,
        private startCourseUseCase: StartCourse
    ) {
        super();
    }

    protected async _run(ctx: BaseCtx, event: DomainEvent): Promise<void> {
        if (event.name !== 'ItemCompleted') return;

        const { ticketId } = event.payload;

        // Use system context to read the current state
        const systemCtx = ContextFactory.createSystem();
        const ticket = await this.repo.getById(systemCtx, ticketId);
        if (!ticket) return;

        // Logic: If all items in Course 1 are COMPLETED, start Course 2
        const course1Items = ticket._data.items.filter((it: any) => it._data.course === 1);
        const allCourse1Done = course1Items.every((it: any) => it._data.status === 'COMPLETED');

        const course2Items = ticket._data.items.filter((it: any) => it._data.course === 2);
        const course2NotStarted = course2Items.some((it: any) => it._data.status === 'RECEIVED');

        if (allCourse1Done && course2NotStarted) {
            await this.startCourseUseCase.run({ ticketId, course: 2 }, 'System:Workflow');
        }
    }
}
