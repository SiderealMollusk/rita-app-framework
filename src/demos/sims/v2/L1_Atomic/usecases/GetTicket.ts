import { QueryUseCase } from '../../../../../core';
import { GetTicketComponent, GetTicketInput } from './GetTicketComponent';

export class GetTicket extends QueryUseCase<GetTicketInput, any> {
    private component: GetTicketComponent;

    constructor(repo: any) {
        super();
        this.component = new GetTicketComponent(repo);
    }

    public async run(input: GetTicketInput): Promise<any> {
        return this.executeQuery(this.component, input);
    }
}
