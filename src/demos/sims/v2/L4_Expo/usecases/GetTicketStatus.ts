import { QueryUseCase, ContextFactory, NotFoundError } from '../../../../../core';

export interface GetTicketStatusInput {
    id: string;
}

export class GetTicketStatus extends QueryUseCase<GetTicketStatusInput, string> {
    constructor(private repo: any) {
        super();
    }

    public async run(input: GetTicketStatusInput): Promise<string> {
        const ctx = ContextFactory.createSystem();
        const ticket = await this.repo.getById(ctx, input.id);
        if (!ticket) throw new NotFoundError('KitchenTicket', input.id);
        return ticket._data.status;
    }
}
