30 — Core API (Ṛta Framework)

This document defines the stable, non-negotiable surface of the Ṛta Core.

Goal: Provide a consistent set of primitives that enforce the framework's architecture across all implementations.

⸻

1) The Execution Kernel: `OperationScope`

The `OperationScope` is the primary interface for all application logic.

```typescript
export class OperationScope {
    readonly context: BaseCtx;
    readonly uow: UnitOfWork;

    // Authorizes domain state changes
    authorize<T>(policy: DecisionPolicy, action: (token: PolicyToken) => T): T;

    // Creates a sub-trace
    fork(name: string): OperationScope;
}
```

⸻

2) Context & Security API

ContextFactory
The only legal way to create and promote execution contexts.
	•	`createExternal()`
	•	`promoteToInternal()`
	•	`promoteToCommand()`
	•	`elevateToSystem()`

CapabilityBag
Stored in the context; holds unforgeable tokens of authority.
	•	`CommitCap`: Required for repository writes.
	•	`RawQueryCap`: Required for admin-level raw DB queries.
	•	`PolicyToken`: Required for domain evolution.

⸻

3) Domain Safety API

BaseEntity / BaseValueObject
Immutable state containers with built-in validation and provenance.

PolicyToken
Proof of authority for mutation. Its constructor is private and can only be accessed via `OperationScope.authorize()`.

DecisionPolicy
Pure logic units that inspect state and context to propose `Evolutions`.

⸻

4) Application Patterns API (The "Strict" Suite)

Located in `src/patterns/strict/`, these are the recommended base classes.

StrictUseCase
Managed execution with Zod validation, tracing, and mandatory scope.

StrictEntity
Domain entities that enforce the use of `PolicyTokens` for all state changes.

StrictPrimaryAdapter
Helpers for creating `OperationScope` from external requests.

StrictRepository
Interfaces for data access that are coupled to the `UnitOfWork` in the active scope.

⸻

5) Observability API

Tracer
Managed spans that automatically propagate `traceId` and link parent/child execution.

Logger
Structured logging that requires an active context and uses standardized tags (`[Evolution]`, `[Component: Start]`, etc.).

⸻

6) Determinism API

RitaClock
The authoritative time source. Implements `ClockPort`.
	•	`now()`: Returns the current (possibly simulated) date.

SimulatedClock / SimulatedRandom
Used in tests to ensure 100% deterministic and reproducible execution.

⸻

7) Enforcement API

ForbiddenScan
A test-time scanner that blocks banned APIs (like `Math.random` or `Date.now`) in the domain layer.

BoundaryAssert
Runtime guards that throw `KernelError` subclasses (e.g., `UnauthorizedError`, `ForbiddenError`) when architectural rules are violated.
