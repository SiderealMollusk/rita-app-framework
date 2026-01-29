# Simulation Harness V2 Specification

**Role:** The "Matrix" Container for Governed Execution.
**Goal:** Provide a deterministic, synchronous environment for executing complex business scenarios.

## 1. Core Components

### 1.1 `SimulationWorld`
The container that owns the state of the simulation.

```typescript
export interface SimulationWorld {
    clock: SimulatedClock;
    random: SimulatedRandom;
    eventBus: InMemoryEventBus;

    // Feature-specific repositories/adapters
    adapters: Record<string, any>;

    // The Kernel (App Entry Point)
    kernel: {
        dispatch(actor: string, intent: string, payload: any): Promise<any>;
        query(queryName: string, params: any): Promise<any>;
    };
}
```

### 1.2 `HarnessFactory`
A static factory to bootstrap the world.

```typescript
export class HarnessFactory {
    /**
     * Creates a fresh SimulationWorld.
     * @param seed For deterministic randomness.
     */
    static create(seed: number = 1): SimulationWorld;
}
```

### 1.3 `ScenarioRunner`
The engine that executes the "Sheet Music".

```typescript
export class ScenarioRunner {
    constructor(private world: SimulationWorld) {}

    /**
     * Executes a scenario defined as data.
     */
    async play(scenario: Scenario): Promise<void>;
}
```

## 2. Scenario Schema (Zod)

Scenarios must be data-driven to allow for replayability and external generation.

```typescript
const StepSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('wait'),
        ms: z.number().describe("Advance virtual clock by ms")
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
        expect: z.any().describe("Deep equality check on query result")
    })
]);

const ScenarioSchema = z.object({
    name: z.string(),
    seed: z.number().default(1),
    steps: z.array(StepSchema)
});
```

## 3. The "Laws of Physics"

1. **Determinism:** No `Date.now()`, no `Math.random()`. All components MUST use the provided `clock` and `random` instances.
2. **Synchronicity:** All IO (Database, Event Bus) must be replaced with in-memory synchronous versions.
3. **Microtask Flushing:** The `clock.advance()` method MUST drain the microtask queue (`process.nextTick`) after every tick to ensure Promises resolve before the next "second" of simulation time.

## 4. Acceptance Criteria for Execution

1. **Replayability:** Running the same scenario with the same seed MUST produce identical logs and state snapshots.
2. **Observability:** Every step must emit a `SimulationStepTrace` to the Logger.
3. **Safety:** Any attempt to perform non-simulated IO (e.g. real network call) must throw a `ForbiddenError`.
