40 — Execution Flows (Ṛta Framework)

This document defines the canonical runtime sequences of Ṛta.
Every execution path in the system should follow one of these managed flows.

⸻

1) The Core Pattern

All flows in Ṛta follow this managed lifecycle:

Ingress (Adapter)
→ Scope Creation (OperationScope)
→ Trust Promotion (ContextFactory)
→ Orchestration (StrictUseCase)
→ Policy Evaluation (StrictPolicy)
→ Evolution (PolicyToken)
→ Persistence (StrictRepository / UnitOfWork)
→ Post-Commit (Event Dispatching)
→ Exit

⸻

2) External Command Flow (Write Path)

Use this for state-changing operations (HTTP POST/PUT, CLI commands).

Sequence:
1. **Ingress:** `StrictPrimaryAdapter` receives untrusted input.
2. **Scope Creation:** Adapter creates a `CommandScope` (which includes a `UnitOfWork` and a `CommandCtx`).
3. **Orchestration:** `StrictUseCase.run(scope, input)` is invoked.
   - Starts a managed trace span.
   - Validates input using Zod.
4. **Business Logic:** Use Case invokes one or more `StrictPolicies`.
   - Uses `scope.authorize(policy, token => ...)` to obtain a `PolicyToken`.
   - Policy returns `Evolutions`.
5. **Evolution:** Use Case applies evolutions to `StrictEntities`.
   - Requires the `PolicyToken`.
   - Provenance is automatically recorded.
6. **Persistence:** Use Case saves entities via `scope.uow.repository.save(entity)`.
   - Entities and their events are staged in the `UnitOfWork`.
7. **Commit:** Use Case commits the transaction via `scope.uow.commit()`.
   - Atomic write of state and outbox events.
8. **Egress:** Post-commit handlers (or the outbox dispatcher) publish events.

⸻

3) External Query Flow (Read Path)

Use this for side-effect free operations (HTTP GET).

Sequence:
1. **Ingress:** `StrictPrimaryAdapter` creates a `QueryScope` (Read-only `InternalCtx`, no `UnitOfWork`).
2. **Orchestration:** `StrictUseCase.run(scope, input)` validates input.
3. **Data Access:** Use Case calls repositories for data.
   - Note: Repositories must reject write operations since the scope lacks `CommitCap`.
4. **Return:** Data is returned; no transaction or outbox events are created.

⸻

4) Internal Command Flow (Job / Saga Path)

Use this for background tasks, event handlers, or scheduled jobs.

Sequence:
1. **System Ingress:** A background runner or event bus creates an `InternalCtx` (or `SystemCtx`).
2. **Scope Creation:** An `OperationScope` is created for the task.
3. **Execution:** Follows the same Orchestration -> Policy -> Persistence flow as an External Command.

⸻

5) Trace Hierarchy

A valid execution flow must produce a trace graph that reflects the architecture:

[StrictPrimaryAdapter] (Root)
└── [StrictUseCase]
    ├── [StrictPolicy] (Decision)
    ├── [StrictRepository] (I/O)
    └── [StrictSecondaryAdapter] (I/O)

If the trace tree appears flat or recursive (e.g., Repository calling UseCase), it indicates an architectural violation.

⸻

6) Anti-Patterns (Forbidden Flows)

The framework is designed to make these flows difficult or impossible:
- **Direct DB Access from UseCase:** Must go through a Repository.
- **I/O inside a Policy:** Policies must remain pure and deterministic.
- **Mutation without a Token:** `StrictEntity` evolution requires a `PolicyToken` from `scope.authorize()`.
- **Nested Transactions:** Opening a `UnitOfWork` inside another is a terminal error.

⸻

7) Failure & Recovery

- **Validation Errors:** Caught at the `StrictUseCase` boundary; results in a `400 Bad Request` or equivalent.
- **Authorization Errors:** Caught by `OperationScope` or `PolicyToken` checks; results in `403 Forbidden`.
- **Infrastructure Failures:** Caught and recorded in the trace; transaction is rolled back via `UnitOfWork.rollback()`.
