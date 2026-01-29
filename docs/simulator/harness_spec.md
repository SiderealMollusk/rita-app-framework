# Simulation Harness Specification

## 1. Overview

**What:** A deterministic, code-driven wrapper (The Harness) that encases the core **Domain** and **Application** layers. It replaces all external dependencies—human actors, physical time, and network IO—with programmable **Virtual Actors** and **Test Doubles**.

**Why:** To stress-test the Hexagonal Architecture through complex scenarios (concurrency, temporal delays, race conditions) without the overhead of HTTP, databases, or real-time waiting. It proves the correctness of **Policies** and **Use Cases** via a pure stream of structured logs (spans).

## 2. Core Infrastructure

These utilities are the foundation of the simulation, ensuring all runs are completely reproducible.

### A. The Virtual Clock (`SimulatedClock` implements `ClockPort`)

**Role:** Replaces system time. The domain never accesses `Date.now()` directly.

**Capabilities:**
*   **Tick-based:** Time advances only when explicitly commanded (`clock.advance(5000)`).
*   **Scheduler:** Allows registering callbacks for future ticks. This drives "cooking times", "timeouts", and Policy re-evaluations.

### B. The Randomness Provider (`SimulatedRandom` implements `RandomPort`)

**Role:** Replaces `Math.random()`.

**Capabilities:**
*   **Seeded Determinism:** Allows seeding so that "random" chaos (e.g., a network failure or a chef delay) happens at the exact same tick in every test run.
*   **Usage:** Used by **Virtual Actors** to decide delays or error injection rates.

## 3. Complexity Levels & Harness Requirements

### Level 1: The Linear Workflow ("Hello World")

**Goal:** Verify basic **UseCase** lifecycle (e.g., `CreateResource` -> `UpdateResource` -> `CloseResource`).

**Harness Requirement:** `ScenarioRunner`.
A simple loop that reads a static list of **Requests**, converts them to `ExternalCtx`, and dispatches them to the appropriate **UseCase**.
Must allow assertions on the resulting **Telemetry Stream** (Logs/Spans).

**Scenario:**
1.  Actor creates Entity #1.
2.  Actor modifies Entity #1.
3.  Actor finalizes Entity #1.

**Success Metric:** Log stream shows `EntityClosed` event/span after the final modification.

### Level 2: The View Projection ("Split Views")

**Goal:** Verify **QueryUseCases** or **SecondaryAdapters** that project state into different read models.

**Harness Requirement:** `MultiViewObserver`.
The Harness acts as a Secondary Adapter, subscribing to the domain outputs and maintaining in-memory arrays for specific views (e.g., "Manager View", "User View").

**Scenario:**
1.  Create Entity with properties "PublicData" and "PrivateData".
2.  Harness asserts: "PublicData" exists in User View; "PrivateData" missing from User View.

**Success Metric:** Correct data visibility verified by inspecting the observer state.

### Level 3: Temporal Logic ("The Delay")

**Goal:** Verify **Policies** that coordinate timing (e.g., "Don't trigger Phase 2 until Phase 1 is 15 mins old").

**Harness Requirement:** `Clock-Driven Scheduler`.
The Harness must process a "Pending Job Queue" whenever `clock.advance()` is called.

**Scenario:**
1.  Initiate Process: Step A (requires 20m) + Step B (requires 5m).
2.  `clock.advance(1 min)` -> Verify Step A is "Active", Step B is "Pending".
3.  `clock.advance(15 min)` -> Verify Step B switches to "Active" (via Policy trigger).

**Success Metric:** Log timestamps show exact 15-minute gap between `PolicyExecuted` events.

### Level 4: Invariant Stress ("The Modifier Explosion")

**Goal:** Ensure **Aggregates** (Value Objects/Entities) protect their invariants against invalid **Evolutions**.

**Harness Requirement:** `ChaosAgent`.
A script that listens for specific spans/events and attempts to inject invalid commands immediately after.

**Scenario:**
1.  Agent: Listens for `ProcessStarted` span.
2.  Action: Immediately fires `ModifyConfiguration` command (changing parameters that should be locked).
3.  Domain: Must reject this command because the process has started.

**Success Metric:** Logs show a structured `DomainValidationError` or `BusinessRuleViolationError` rather than a system crash or silence.

### Level 5: Concurrency Bottleneck ("The Thundering Herd")

**Goal:** Simulate high-throughput contention to test the `UnitOfWork` coordinator's ability to handle optimistic locking and retries.

**Harness Requirement:** `AutonomousAgents`.
Multiple independent loops acting as distinct users, using `SimulatedRandom` to pick random think-times and actions.

**Scenario:**
1.  Inject 50 concurrent requests targeting the same Aggregate.
2.  Call `clock.runUntilEmpty()`.

**Success Metric:**
*   Logs show `OptimisticLockError` causing retries (handled by `UnitOfWork` or Adapter).
*   Final state is consistent (no "orphaned" updates).
*   All valid commands eventually process or explicitly fail.
