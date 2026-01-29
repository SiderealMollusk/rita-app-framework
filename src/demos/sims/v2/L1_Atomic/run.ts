import { HarnessFactory } from '../../../../extras/simulator/HarnessFactory';
import { ScenarioRunner, Scenario } from '../../../../extras/simulator/SimulatorSkeleton';

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
            kind: 'assert',
            query: 'GetTicket',
            params: { ticketId: 'ticket-1' },
            expect: {
                status: 'RECEIVED',
                items: [{ name: 'Burger', status: 'RECEIVED' }]
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
                items: [{ name: 'Burger', status: 'COOKING' }]
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
                items: [{ name: 'Burger', status: 'COMPLETED' }]
            }
        }
    ]
};

async function run() {
    const world = HarnessFactory.createL1();
    const runner = new ScenarioRunner(world);

    // Silence console for clean JSONL output if desired,
    // but here we want to see it.

    try {
        await runner.play(scenario);
        // console.log("L1 Simulation completed successfully!");
    } catch (err) {
        console.error("L1 Simulation failed:", err);
        process.exit(1);
    }
}

run();
