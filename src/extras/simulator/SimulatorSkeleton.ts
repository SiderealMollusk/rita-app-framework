import { SimulatedClock, SimulatedRandom, InMemoryEventBus, Logger, IdGeneratorPort } from '../../core';
import { Schema as z, SchemaType } from '../../core/validation/Schema';
import * as util from 'util';

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
    idGen: IdGeneratorPort;
    adapters: Record<string, any>;
    dispatch(actor: string, intent: string, payload: any): Promise<any>;
    query(queryName: string, params: any): Promise<any>;
    settle(): Promise<void>;
}

export class ScenarioRunner {
    constructor(private world: SimulationWorld) { }

    async play(scenario: Scenario): Promise<void> {
        for (const step of scenario.steps) {
            switch (step.kind) {
                case 'wait':
                    Logger.info(`[Sim: Wait]`, { ms: step.ms });
                    await this.world.clock.advance(step.ms);
                    break;
                case 'act':
                    try {
                        await this.world.dispatch(step.actor, step.intent, step.payload);
                    } catch (err) {
                        // Business errors are expected in some scenarios
                    }
                    await this.world.settle();
                    break;
                case 'assert':
                    const result = await this.world.query(step.query, step.params);
                    // Implementation note: use deep equality check
                    if (!util.isDeepStrictEqual(result, step.expect)) {
                        throw new Error(`Assertion failed for ${step.query}. Expected ${JSON.stringify(step.expect)}, got ${JSON.stringify(result)}`);
                    }
                    break;
            }
        }
    }
}
