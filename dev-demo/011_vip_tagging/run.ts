import { TagOrderController } from './TagOrderController';
import { UserGateway } from './UserGateway';
import { OrderRepository } from './OrderRepository';

// Runtime Demo Script
// Usage: npx ts-node dev-demo/011_vip_tagging/run.ts

async function main() {
    console.log("🚀 Starting Demo: VIP Tagging...\n");

    // 1. Wiring (Composition Root)
    // We inject the "Stub" adapters here
    const controller = new TagOrderController(
        new UserGateway(),
        new OrderRepository()
    );

    // 2. Execution (Scenario: Gold User)
    console.log("--- SCENARIO: Gold User places order ---");
    const result1 = await controller.run({
        orderId: 'o_demo_1',
        userId: 'u_gold', // STUB: Triggers 'GOLD' tier
        amount: 50
    });
    console.log("Result:", result1);
    console.log("\n");

    // 3. Execution (Scenario: High Value)
    console.log("--- SCENARIO: High Value Order ---");
    const result2 = await controller.run({
        orderId: 'o_demo_2',
        userId: 'u_std',
        amount: 2500 // > 1000
    });
    console.log("Result:", result2);
}

main().catch(console.error);
