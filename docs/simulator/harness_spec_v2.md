# Simulation Harness Specification (V2)

**Status:** Draft / Proposed
**Supersedes:** `harness_spec.md`

## 1. The Architectural Gap

Standard testing fits into two buckets:
1.  **Unit Tests:** Fast but narrow. Mock everything using `jest.fn()`.
2.  **E2E Tests:** Broad but slow/flaky. Real DB, real Network, real Time.

The **Simulation Harness** fills the gap: **Broad, Fast, Deterministic.**
It runs the *entire* application layer in-memory, replacing only the "Physical Layout" (Time, Randomness, IO) with programmable, synchronous substitutes.

## 2. Core Metaphor: The "Matrix" Container

We introduce `SimulationWorld`, a container that owns the dependency injection graph and the "Laws of Physics" for the test.

```typescript
type SimulationWorld = {
  // The Laws of Physics
  clock: SimulatedClock;
  random: SimulatedRandom;
  
  // The System Under Test
  kernel: Kernel; // The Hexagon
  ports: {
      db: InMemoryDatabase; // Secondary Adapter
      mail: InMemoryMailer; // Secondary Adapter
  };
  
  // God Mode Controls
  admin: {
      grantCap(cap: Capability): void;
      inspectState(id: EntityId): Promise<unknown>;
  }
}
```

## 3. Strict Interfaces

### A. The Master Clock
The `SimulatedClock` is not just a date provider; it is an event loop controller.

```typescript
interface SimulatedClock extends ClockPort {
  /**
   * Advances virtual time by `ms`.
   * CRITICAL: Must flush the microtask queue (Promises) after each "tick" 
   * to ensure async logic completes deterministically.
   */
  advance(ms: number): Promise<void>;

  /**
   * Runs until no scheduled tasks remain in the queue.
   * Useful for "settling" the system.
   */
  runUntilIdle(): Promise<void>;
  
  /**
   * Schedules a task for the future (replaces setTimeout).
   */
  schedule(callback: () => void, delayMs: number): CancelToken;
}
```

### B. The Deterministic Chaos (Randomness)
We do not use `Math.random()`. We use a seeded generator that allows us to replay "bad luck".

```typescript
interface SimulatedRandom extends RandomPort {
  /** Returns a float between 0-1, deterministically based on seed + call count */
  next(): number;
  
  /** Returns true if a chaotic failure should occur based on configured probability */
  shouldFail(probability: number): boolean;
}
```

## 4. Scenario Definition (The "Sheet Music")

Tests are defined as data, not just code. This allows running the same scenario with different "seeds" or "load factors".

We use strict **Zod Schemas** to define these scenarios.

### Schema Definition

```typescript
const StepSchema = z.union([
  // 1. Time Travel
  z.object({ kind: z.literal('wait'), ms: z.number() }),
  
  // 2. Actor Action
  z.object({ 
    kind: z.literal('act'), 
    actor: z.string(), 
    intent: z.string(), // "CreateUser", "ApproveLoan"
    payload: z.record(z.unknown())
  }),
  
  // 3. Assertion
  z.object({
    kind: z.literal('assert'),
    query: z.string(), // "UserView.findById(1)"
    expect: z.unknown()
  })
]);

const ScenarioSchema = z.object({
  name: z.string(),
  seed: z.number().default(1),
  actors: z.array(z.string()), // ["admin", "user_alice"]
  steps: z.array(StepSchema)
});
```

## 5. Implementation Strategy

### The `HarnessFactory`
A factory that assembles the `SimulationWorld`.

```typescript
class HarnessFactory {
  static create(config: HarnessConfig): SimulationWorld {
    const clock = new SimulatedClock(0); // Epoch 0
    // Inject the simulated clock into the global static accessor if needed
    RitaClock._setTestClock(clock);

    const bus = new InMemoryEventBus(); // New Component needed
    const db = new InMemoryDatabase();
    
    // Check wiring consistency
    const kernel = new Kernel({
      clock,
      bus,
      db
    });
    
    return { clock, kernel, ... };
  }
}
```

> [!NOTE]
> **Infrastructure Gap:** We currently do not have an `EventBus` or `Telemetry` system. This is required for L1+ verification.

### The `ScenarioRunner`
The engine that executes the "Sheet Music".

```typescript
class ScenarioRunner {
  constructor(private world: SimulationWorld) {}

  async play(scenario: InputScenario) {
    // 1. Setup Actors
    const actorMap = this.spawnActors(scenario.actors);
    
    // 2. Loop Steps
    for (const step of scenario.steps) {
      switch(step.kind) {
        case 'wait': 
          await this.world.clock.advance(step.ms);
          break;
        case 'act':
          await actorMap.get(step.actor).dispatch(step.intent, step.payload);
          break;
        case 'assert':
          await this.verify(step.query, step.expect);
          break;
      }
    }
  }
}
```

## 6. Levels of Simulation

| Level | Name | The Story (Use Case) | Sim Component Needed | Verification (The Log Check) |
| :--- | :--- | :--- | :--- | :--- |
| **L1** | **Atomic** | **"The Happy Path."**<br>A waiter enters 1 Burger. The kitchen starts it, cooks it, and plates it. | **Command Bus**<br>(Basic plumbing) | **[T=1]** TicketCreated<br>**[T=2]** ItemStarted<br>**[T=3]** ItemCompleted |
| **L2** | **Router** | **"The Fan-Out."**<br>1 Ticket splits into 3 streams: Burger (Grill), Fries (Fryer), Coke (Bar). | **Projectors**<br>(In-memory filtered arrays) | Assert GrillView contains "Burger".<br>Assert BarView contains "Coke".<br>Assert Ticket is still 1 entity. |
| **L3** | **Duration** | **"The Wait."**<br>Cooking isn't instant. A Burger takes 10 mins; a Steak takes 20. | **Scheduler**<br>(The Virtual Clock) | **[T=0]** ItemStarted (Steak)<br>... silence ...<br>**[T=20]** ItemCompleted (Steak) |
| **L4** | **Expo** | **"The Merge."**<br>The Ticket cannot close until all items (fast & slow) arrive at the window. | **Aggregator**<br>(Parent/Child Status check) | **[T=10]** Burger Done (Ticket OPEN)<br>**[T=20]** Steak Done (Ticket CLOSED) |
| **L5** | **Pacing** | **"The Chain Reaction."**<br>Finishing "Appetizers" automatically triggers the "Entrees" to start cooking. | **Process Manager**<br>(Event Listener / Saga) | User completes Apps.<br>Log shows: **[T=30]** EVENT: Course 1 Done<br>Log shows: **[T=30]** CMD: Fire Course 2 (Auto) |
