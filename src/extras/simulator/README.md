# Simulation Harness

The Simulation Harness provides a deterministic, high-speed environment for executing business scenarios. It allows you to run complex, time-sensitive logic at CPU speeds while maintaining full control over time, randomness, and identity.

## Core Concepts

### 1. Determinism
All "laws of physics" in the simulation are governed by injectable ports:
- **`SimulatedClock`**: Controls virtual time. Advancing the clock processes scheduled tasks in order.
- **`SimulatedRandom`**: A seeded pseudo-random number generator.
- **`SimulatedIdGenerator`**: Produces predictable IDs (e.g., `ticket-1`, `ticket-2`).

### 2. Synchronicity
All operations in the simulator are synchronous or resolve immediately using microtask flushing. This ensures that a scenario execution is perfectly reproducible.

### 3. Settle / Come to Rest
After every action (`act` step), the simulator calls `world.settle()`. This method drains all 0ms scheduled tasks and microtasks, ensuring the system reaches a stable state before the next step or assertion.

## How to Run Simulations

You can run simulations using the following npm scripts:

```bash
# Run the L1 Atomic Simulation
npm run sim:l1
```

## Scenario Definition

Scenarios are defined as data-driven "Sheet Music" using the `Scenario` schema:

```typescript
const scenario: Scenario = {
    name: "My Scenario",
    seed: 1,
    steps: [
        { kind: 'act', actor: 'User', intent: 'DoSomething', payload: { ... } },
        { kind: 'wait', ms: 5000 },
        { kind: 'assert', query: 'GetStatus', params: { ... }, expect: { ... } }
    ]
};
```

### Step Kinds:
- **`act`**: Dispatches a command to a UseCase.
- **`wait`**: Advances the virtual clock by the specified milliseconds.
- **`assert`**: Executes a query and compares the result against an expected value.

## Checking the Logs

The simulator outputs logs in JSONL format. These logs include:
- `timestamp`: The virtual time when the log was emitted.
- `traceId`: A deterministic trace ID for tracking execution flow.
- `evolution`: Details of state mutations.
- `snapshot`: The resulting state after a mutation.

### Log Verification

To ensure no regressions in execution flow, we use "golden" log files. Tests compare the actual output against these reference files.

Existing golden files can be found in `__tests__` directories, e.g.:
`src/demos/sims/v2/L1_Atomic/__tests__/L1_HappyPath.golden.jsonl`

## Extending the Simulator

To add new UseCases or Adapters to the simulation, update the `HarnessFactory` or create a new factory method.

```typescript
const world = HarnessFactory.createL1();
world.registerUseCase('MyNewUseCase', new MyUseCase(...));
```
