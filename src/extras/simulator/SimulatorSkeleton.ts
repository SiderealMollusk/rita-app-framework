import { SimulatedClock, SimulatedRandom, InMemoryEventBus, Logger } from '../../core';
import { Schema as z, SchemaType } from '../../core/validation/Schema';

export const StepSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('wait'),
        ms: z.number()
    }),
    z.object({
        kind: z.literal('act'),
        actor: z.string(),
        intent: z.string(),
        payload: z.any()
    }),
    z.object({
        kind: z.literal('assert'),
        query: z.string(),
        params: z.any().optional(),
        expect: z.any()
    })
]);

export type Step = SchemaType<typeof StepSchema>;

export const ScenarioSchema = z.object({
    name: z.string(),
    seed: z.number().default(1),
    steps: z.array(StepSchema)
});

export type Scenario = SchemaType<typeof ScenarioSchema>;

export interface SimulationWorld {
    clock: SimulatedClock;
    random: SimulatedRandom;
    eventBus: InMemoryEventBus;
    adapters: Record<string, any>;
    dispatch(actor: string, intent: string, payload: any): Promise<any>;
    query(queryName: string, params: any): Promise<any>;
}

export class ScenarioRunner {
    constructor(private world: SimulationWorld) {}

    async play(scenario: Scenario): Promise<void> {
        for (const step of scenario.steps) {
            switch (step.kind) {
                case 'wait':
                    Logger.info(`[Sim: Wait]`, { ms: step.ms });
                    await this.world.clock.advance(step.ms);
                    break;
                case 'act':
                    await this.world.dispatch(step.actor, step.intent, step.payload);
                    break;
                case 'assert':
                    const result = await this.world.query(step.query, step.params);
                    // Implementation note: use deep equality check
                    if (JSON.stringify(result) !== JSON.stringify(step.expect)) {
                        throw new Error(`Assertion failed for ${step.query}. Expected ${JSON.stringify(step.expect)}, got ${JSON.stringify(result)}`);
                    }
                    break;
            }
        }
    }
}
