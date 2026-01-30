20 — Contracts and Boundaries (Ṛta Framework)

This document defines the enforceable rules of Ṛta.

Goal: Turn architectural principles into mechanical constraints so that code defaults to being safe, traceable, and attributable.

⸻

1) The Prime Directive: Governed Execution

All execution within the framework must be governed by an `OperationScope`.

Rules:
	•	No logic runs without a scope.
	•	The scope is the sole authority for identity, services, and mutation tokens.
	•	The scope propagates the distributed trace automatically.

⸻

2) Domain Contract: Immutable Evolution

Domain state (Entities and Value Objects) is immutable.

Rules:
	•	Direct mutation is forbidden.
	•	Evolution requires a `PolicyToken`.
	•	A `PolicyToken` is only obtainable via `OperationScope.authorize(policy, ...)`.
	•	Every evolution must include a human-readable `reason`.

Enforcement:
	•	`StrictEntity` and `StrictValueObject` enforce these rules at the type and runtime level.

⸻

3) Application Contract: Orchestration via UseCases

All external entry points must delegate to a `StrictUseCase`.

Rules:
	•	Input and Output must be validated against Zod schemas.
	•	UseCases must not contain domain logic; they orchestrate Policies.
	•	UseCases are responsible for managing the transaction via the `UnitOfWork`.

Enforcement:
	•	`StrictUseCase` provides the template for this flow.

⸻

4) Persistence Contract: Transactional Integrity

Writes to the database must be atomic and include domain events.

Rules:
	•	Durable writes are only allowed within a `UnitOfWork`.
	•	The `UnitOfWork` is accessed exclusively through the `OperationScope`.
	•	Domain events are staged in the `UnitOfWork` and committed atomically with state.

Enforcement:
	•	`StrictRepository` and `StrictUnitOfWork` types enforce these boundaries.

⸻

5) Boundary Roles (The May-Call Matrix)

| From \ To | Primary Adapter | Use Case | Domain Policy | Repository | Secondary Adapter |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Primary Adapter** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Use Case** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Domain Policy** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Repository** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Secondary Adapter** | ❌ | ❌ | ❌ | ❌ | ❌ |

Key Enforcement:
	•	**BoundaryCheck:** A test-time tool that scans imports to ensure no layer is bypassing its neighbor (e.g., Ingress calling Repository directly).

⸻

6) Determinism Boundary

Domain logic (Policies and Entities) must be side-effect free and deterministic.

Forbidden in Domain:
	•	`Date.now()` or `new Date()` (Use `RitaClock` instead).
	•	`Math.random()` (Use `SimulatedRandom` for tests).
	•	I/O (Filesystem, Network, DB).
	•	Direct imports of adapters or ports.

Enforcement:
	•	**ForbiddenScan:** Scans the `domain/` and `policy/` directories for banned tokens.

⸻

7) Trust Levels and Promotion

Identity is managed via monotonic context promotion in the `ContextFactory`.

	•	**ExternalCtx:** Untrusted input. Valid only in Ingress.
	•	**InternalCtx:** Trusted for logic and reads.
	•	**CommandCtx:** Trusted for writes (holds `CommitCap`).
	•	**SystemCtx:** Admin-level access (holds `RawQueryCap`, `AdminCap`).

Rules:
	•	Promotion is the only way to move between levels.
	•	Promotion is explicit and recorded in the trace.

⸻

8) Summary of Enforcement Mechanisms

1. **Type-Level Locks:** `OperationScope` and `PolicyToken` make illegal states unrepresentable.
2. **Runtime Guards:** `require()` checks in `CapabilityBag` and `PolicyToken.isAuthorized()`.
3. **Structural Tests:** `ForbiddenScan` and `BoundaryCheck` ensure the folder structure reflects the architecture.
4. **Governed Logging:** Standardized tags and mandatory trace IDs in all logs.
