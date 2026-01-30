import { HarnessFactory } from '../../../../../extras/simulator/HarnessFactory';
import { ScenarioRunner, Scenario } from '../../../../../extras/simulator/SimulatorSkeleton';
import { LogVerifier } from '../../../../../extras/simulator/LogVerifier';
import * as path from 'path';

const scenario: Scenario = {
    name: "L3 Duration",
    seed: 1,
    steps: [
        {
            kind: 'act',
            actor: 'Waiter',
            intent: 'PlaceOrder',
            payload: { item: 'Steak' }
        },
        {
            kind: 'act',
            actor: 'Chef',
            intent: 'StartCooking',
            payload: { ticketId: 'ticket-1' }
        },
        {
            kind: 'wait',
            ms: 600000 // 10 mins
        },
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'COOKING',
                items: [{ name: 'Steak', status: 'COOKING', course: 1 }]
            }
        },
        {
            kind: 'wait',
            ms: 600000 // Another 10 mins (Total 20)
        },
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'COMPLETED',
                items: [{ name: 'Steak', status: 'COMPLETED', course: 1 }]
            }
        }
    ]
};

describe('L3 Duration Simulation', () => {
    it('should complete item at the correct virtual time', async () => {
        const world = HarnessFactory.createL3();
        const runner = new ScenarioRunner(world);

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (msg: string) => { logs.push(msg); };

        try {
            await runner.play(scenario);
        } finally {
            console.log = originalLog;
        }

        const goldenFile = path.join(__dirname, 'L3_Duration.golden.jsonl');
        LogVerifier.verify(logs, goldenFile);
    });
});
