import { HarnessFactory } from '../../../../../extras/simulator/HarnessFactory';
import { ScenarioRunner, Scenario } from '../../../../../extras/simulator/SimulatorSkeleton';
import { LogVerifier } from '../../../../../extras/simulator/LogVerifier';
import * as path from 'path';

const scenario: Scenario = {
    name: "L4 Expo Merge",
    seed: 1,
    steps: [
        {
            kind: 'act',
            actor: 'Waiter',
            intent: 'PlaceOrder',
            payload: { item: 'Burger' } // Note: L1 PlaceOrder creates a ticket with items: [item]
        },
        // We need another item to test the merge, but L1 PlaceOrder only takes one item.
        // I'll update the scenario to use multiple PlaceOrders if needed, but wait,
        // L1 KitchenTicket is created with the provided items.
        // Let's assume for this scenario we have a ticket with 2 items.
        // Since L1 PlaceOrder only supports 1 item, I'll just place one order and test the rejection by NOT finishing it.
        {
            kind: 'act',
            actor: 'Chef',
            intent: 'FinishItem',
            payload: { ticketId: 'ticket-1', item: 'Burger' }
        },
        // Wait, if I want to test rejection, I need an item that is NOT finished.
        // I'll manually seed the repo with a ticket having 2 items for this test if I want to match the README exactly.
        // Or I can just use 1 item and try to close BEFORE finishing it.
        {
            kind: 'act',
            actor: 'Expo',
            intent: 'CloseTicket',
            payload: { id: 'ticket-1' }
        },
        {
            kind: 'assert',
            query: 'GetTicketStatus',
            params: { id: 'ticket-1' },
            expect: 'CLOSED'
        }
    ]
};

// Let's make a more faithful scenario by using multiple items.
// I'll update PlaceOrder for L4 to support multiple items if needed,
// or I'll just use the L2 PlaceOrder which supports multiple items!
// HarnessFactory.createL4 uses L1 PlaceOrder. Let's change it to L2 PlaceOrder.

describe('L4 Expo Simulation', () => {
    it('should block closing until all items are ready', async () => {
        const world = HarnessFactory.createL4();
        const runner = new ScenarioRunner(world);

        const scenarioFaithful: Scenario = {
            name: "L4 Expo Merge Faithful",
            seed: 1,
            steps: [
                {
                    kind: 'act',
                    actor: 'Waiter',
                    intent: 'PlaceOrder',
                    payload: { items: ['Burger', 'Steak'] }
                },
                {
                    kind: 'act',
                    actor: 'Chef',
                    intent: 'FinishItem',
                    payload: { ticketId: 'ticket-1', item: 'Burger' }
                },
                {
                    kind: 'act',
                    actor: 'Expo',
                    intent: 'CloseTicket',
                    payload: { id: 'ticket-1' }
                },
                {
                    kind: 'assert',
                    query: 'GetTicketStatus',
                    params: { id: 'ticket-1' },
                    expect: 'OPEN'
                },
                {
                    kind: 'act',
                    actor: 'Chef',
                    intent: 'FinishItem',
                    payload: { ticketId: 'ticket-1', item: 'Steak' }
                },
                {
                    kind: 'act',
                    actor: 'Expo',
                    intent: 'CloseTicket',
                    payload: { id: 'ticket-1' }
                },
                {
                    kind: 'assert',
                    query: 'GetTicketStatus',
                    params: { id: 'ticket-1' },
                    expect: 'CLOSED'
                }
            ]
        };

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (msg: string) => { logs.push(msg); };

        try {
            await runner.play(scenarioFaithful);
        } finally {
            console.log = originalLog;
        }

        const goldenFile = path.join(__dirname, 'L4_Expo.golden.jsonl');
        LogVerifier.verify(logs, goldenFile);
    });
});
