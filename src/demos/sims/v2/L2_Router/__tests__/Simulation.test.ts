import { HarnessFactory } from '../../../../../extras/simulator/HarnessFactory';
import { ScenarioRunner, Scenario } from '../../../../../extras/simulator/SimulatorSkeleton';
import { LogVerifier } from '../../../../../extras/simulator/LogVerifier';
import * as path from 'path';

const scenario: Scenario = {
    name: "L2 Fan Out",
    seed: 1,
    steps: [
        {
            kind: 'act',
            actor: 'Waiter',
            intent: 'PlaceOrder',
            payload: { items: ['Burger', 'Fries', 'Coke'] }
        },
        {
            kind: 'assert',
            query: 'StationView',
            params: { station: 'Grill' },
            expect: ['Burger']
        },
        {
            kind: 'assert',
            query: 'StationView',
            params: { station: 'Fryer' },
            expect: ['Fries']
        },
        {
            kind: 'assert',
            query: 'StationView',
            params: { station: 'Bar' },
            expect: ['Coke']
        }
    ]
};

describe('L2 Router Simulation', () => {
    it('should project items to correct stations', async () => {
        const world = HarnessFactory.createL2();
        const runner = new ScenarioRunner(world);

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (msg: string) => { logs.push(msg); };

        try {
            await runner.play(scenario);
        } finally {
            console.log = originalLog;
        }

        const goldenFile = path.join(__dirname, 'L2_FanOut.golden.jsonl');
        LogVerifier.verify(logs, goldenFile);
    });
});
