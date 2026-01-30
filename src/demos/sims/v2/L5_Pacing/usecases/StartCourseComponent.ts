import { BaseComponent, CommandCtx, NotFoundError, InternalCtx } from '../../../../../core';
import { KitchenPolicy } from '../../L1_Atomic/domain/KitchenPolicy';

export interface StartCourseInput {
    ticketId: string;
    course: number;
}

export class StartCourseComponent extends BaseComponent<StartCourseInput, void> {
    constructor(private repo: any, private policy: KitchenPolicy) {
        super();
    }

    protected async _run(ctx: CommandCtx, input: StartCourseInput): Promise<void> {
        const ticket = await this.repo.getById(ctx, input.ticketId);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.ticketId);

        const evolvedTicket = this.policy.execute(ctx as unknown as InternalCtx, ticket, {
            kind: 'START_COURSE',
            course: input.course
        });
        await this.repo.save(ctx, evolvedTicket);
    }
}
