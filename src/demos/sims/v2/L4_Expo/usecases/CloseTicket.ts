import { CommandUseCase, UnitOfWorkPort } from '../../../../../core';
import { CloseTicketComponent, CloseTicketInput } from './CloseTicketComponent';
import { TicketClosingPolicy } from '../domain/TicketClosingPolicy';

export class CloseTicket extends CommandUseCase<CloseTicketInput, void> {
    private component: CloseTicketComponent;

    constructor(repo: any, policy: TicketClosingPolicy, uowPort: UnitOfWorkPort) {
        super(uowPort);
        this.component = new CloseTicketComponent(repo, policy);
    }

    public async run(input: CloseTicketInput, principal?: string): Promise<void> {
        return this.executeCommand(this.component, input, principal);
    }
}
