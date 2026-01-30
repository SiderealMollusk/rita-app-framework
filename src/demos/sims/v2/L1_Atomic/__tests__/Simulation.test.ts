import { HarnessFactory } from '../../../../../extras/simulator/HarnessFactory';
import { ScenarioRunner, Scenario } from '../../../../../extras/simulator/SimulatorSkeleton';
import { LogVerifier } from '../../../../../extras/simulator/LogVerifier';
import * as path from 'path';

const scenario: Scenario = {
    name: "L1 Happy Path",
    seed: 1,
    steps: [
        {
            kind: 'act',
            actor: 'Waiter',
            intent: 'PlaceOrder',
            payload: { item: 'Burger' }
        },
        {
            kind: 'wait',
            ms: 5000
        },
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'RECEIVED',
                items: [{ name: 'Burger', status: 'RECEIVED', course: 1 }]
            }
        },
        {
            kind: 'act',
            actor: 'Chef',
            intent: 'StartCooking',
            payload: { ticketId: 'ticket-1' }
        },
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'COOKING',
                items: [{ name: 'Burger', status: 'COOKING', course: 1 }]
            }
        },
        {
            kind: 'act',
            actor: 'Chef',
            intent: 'CompleteItem',
            payload: { ticketId: 'ticket-1', itemName: 'Burger' }
        },
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'COMPLETED',
                items: [{ name: 'Burger', status: 'COMPLETED', course: 1 }]
            }
        },
        {
            kind: 'act',
            actor: 'Waiter',
            intent: 'PlaceOrder',
            payload: { item: 'Fries' }
        },
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-2' },
            expect: {
                status: 'RECEIVED',
                items: [{ name: 'Fries', status: 'RECEIVED', course: 1 }]
            }
        }
    ]
};

describe('L1 Atomic Simulation', () => {
    it('should produce deterministic logs matching the golden file', async () => {
        const world = HarnessFactory.createL1();
        const runner = new ScenarioRunner(world);

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (msg: string) => { logs.push(msg); };

        try {
            await runner.play(scenario);
        } finally {
            console.log = originalLog;
        }

        const goldenFile = path.join(__dirname, 'L1_HappyPath.golden.jsonl');
        LogVerifier.verify(logs, goldenFile);
    });
});
