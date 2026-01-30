import { DomainEvent } from '../../../../../core';

export interface TicketCreatedEvent extends DomainEvent {
    name: 'TicketCreated';
    payload: {
        ticketId: string;
        items: string[];
    };
}
