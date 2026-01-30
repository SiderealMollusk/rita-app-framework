import { HarnessFactory } from '../../../../../extras/simulator/HarnessFactory';
import { ScenarioRunner, Scenario } from '../../../../../extras/simulator/SimulatorSkeleton';
import { LogVerifier } from '../../../../../extras/simulator/LogVerifier';
import * as path from 'path';

const scenario: Scenario = {
    name: "L5 Pacing Saga",
    seed: 1,
    steps: [
        {
            kind: 'act',
            actor: 'Waiter',
            intent: 'PlaceOrder',
            payload: {
                items: [
                    { name: 'Wings', course: 1 },
                    { name: 'Calamari', course: 1 },
                    { name: 'Steak', course: 2 }
                ]
            }
        },
        {
            kind: 'act',
            actor: 'Chef',
            intent: 'StartCourse',
            payload: { ticketId: 'ticket-1', course: 1 }
        },
        {
            kind: 'act',
            actor: 'Chef',
            intent: 'FinishItem',
            payload: { ticketId: 'ticket-1', itemName: 'Wings' }
        },
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'COOKING',
                items: [
                    { name: 'Wings', status: 'COMPLETED', course: 1 },
                    { name: 'Calamari', status: 'COOKING', course: 1 },
                    { name: 'Steak', status: 'RECEIVED', course: 2 }
                ]
            }
        },
        {
            kind: 'act',
            actor: 'Chef',
            intent: 'FinishItem',
            payload: { ticketId: 'ticket-1', itemName: 'Calamari' }
        },
        // At this point, Wings and Calamari are done.
        // The KitchenWorkflowManager should automatically trigger StartCourse for Course 2.
        {
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'COOKING',
                items: [
                    { name: 'Wings', status: 'COMPLETED', course: 1 },
                    { name: 'Calamari', status: 'COMPLETED', course: 1 },
                    { name: 'Steak', status: 'COOKING', course: 2 }
                ]
            }
        }
    ]
};

describe('L5 Pacing Simulation', () => {
    it('should automatically start next course when current one is finished', async () => {
        const world = HarnessFactory.createL5();
        const runner = new ScenarioRunner(world);

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (msg: string) => { logs.push(msg); };

        try {
            await runner.play(scenario);
        } finally {
            console.log = originalLog;
        }

        const goldenFile = path.join(__dirname, 'L5_Pacing.golden.jsonl');
        LogVerifier.verify(logs, goldenFile);
    });
});
