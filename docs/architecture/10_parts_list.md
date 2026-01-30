10 — Parts List (Ṛta Framework)

This document is the inventory of nouns in Ṛta.
If something exists in the core, it appears in the table below.

Rule:

If you add a new core concept, add it to the table before writing code.

⸻

1) Sacred Table — The 30-Second View

| Name | Kind | Layer | Purpose (1 line) |
| :--- | :--- | :--- | :--- |
| OperationScope | Class | Core / Scope | Centralized execution container; holds Identity, Services, and Authority. |
| TrustLevel | Type | Core / Context | Runtime privilege classification: external, internal, command, system. |
| BaseCtx | Interface | Core / Context | Common execution context (trace, privilege, capabilities). |
| ExternalCtx | Type | Core / Context | Untrusted request context (ingress only). |
| InternalCtx | Type | Core / Context | Trusted, read-only application context. |
| CommandCtx | Type | Core / Context | Trusted, write-capable context. |
| SystemCtx | Type | Core / Context | Admin/system-only context. |
| ContextFactory | Module | Core / Context | Creates and promotes contexts between privilege levels. |
| CapabilityBag | Class | Core / Auth | Stores and validates unforgeable authority tokens. |
| PolicyToken | Capability | Core / Auth | Authorizes domain state evolution; minted only by OperationScope. |
| CommitCap | Capability | Core / Auth | Authorizes durable writes. |
| RawQueryCap | Capability | Core / Auth | Authorizes raw DB queries (system-only). |
| AdminCap | Capability | Core / Auth | Authorizes administrative operations. |
| Tracer | Service | Core / Observability | Creates and manages managed trace spans. |
| Logger | Service | Core / Observability | Structured logging with mandatory trace context. |
| StrictEntity | Abstract Class | Pattern / Strict | Governed domain state with mandatory PolicyToken for evolution. |
| StrictUseCase | Abstract Class | Pattern / Strict | Orchestrates logic with mandatory OperationScope and Zod validation. |
| StrictPolicy | Abstract Class | Pattern / Strict | Pure decision logic return evolutions; isolated from side effects. |
| StrictRepository | Interface | Pattern / Strict | persistence contract accessed only via OperationScope/UoW. |
| StrictUnitOfWork | Interface | Pattern / Strict | Transactional boundary for durable writes and event staging. |

⸻

2) Execution & Scope System

OperationScope

Kind: Class
Purpose: The single source of truth for an active operation.

Responsibilities:
	•	Identity: Holds the `context` (BaseCtx).
	•	Mechanism: Provides access to the `uow` (Unit of Work).
	•	Authority: The **only** way to mint a `PolicyToken` via `.authorize()`.
	•	Continuity: Creates child scopes via `.fork()` while preserving trace IDs.

⸻

3) Context & Capability System

TrustLevel
Values: `external`, `internal`, `command`, `system`.

CapabilityBag
Stores unforgeable instances of capabilities. Application code cannot construct capabilities; they are core-owned and private.

PolicyToken
A specialized capability required by `BaseEntity.evolve`. It can only be obtained by passing a `DecisionPolicy` to `OperationScope.authorize()`.

⸻

4) The Strict Pattern Suite

Located in `src/patterns/strict/`, these classes provide mechanical enforcement of the architecture.

StrictUseCase
	•	Enforces `requestSchema` and `responseSchema` (Zod).
	•	Requires `OperationScope` for execution.
	•	Automatically manages tracing spans.

StrictEntity / StrictValueObject
	•	Prevents direct mutation.
	•	Requires a `PolicyToken` for creation and evolution.
	•	Ensures provenance is recorded for every change.

StrictRepository / StrictSecondaryAdapter
	•	Enforces boundary rules.
	•	Secondary adapters require outbound schema validation.
	•	Repositories are accessed via the `UnitOfWork` to ensure transactional integrity.

⸻

5) Domain Layer (Core)

BaseValueObject / BaseEntity
Immutable domain state. Evolution is handled via the `_evolve` method, which is protected in `Base` but strictly governed in `Strict` subclasses.

Evolution
A data-only package containing requested changes and a mandatory `reason` string.

DecisionPolicy
Encapsulates pure business logic. Returns a list of `Evolutions` if the operation is permitted.

⸻

6) Observability Kernel

Tracer & Logger
Automatically pull `traceId`, `spanId`, and `trustLevel` from the active context. Standardized tags like `[Component: Start]` and `[Evolution]` are used for consistent log parsing.

⸻

7) Enforcement Tooling

ForbiddenScan
Scans the codebase for banned APIs in the domain layer (e.g., `Date.now`, `Math.random`, `fs`, `http`).

BoundaryCheck
Validates that imports do not cross forbidden layer boundaries (e.g., Domain importing Adapters).

⸻

8) Layer Call Rules (The Law)

| Layer | May Call | Must Not Call |
| :--- | :--- | :--- |
| Primary Adapter | UseCase, ContextFactory, Scope | Domain, Repository, Secondary Adapter |
| Application | Policy, Ports, Secondary Adapter, Repository | Infrastructure libs directly |
| Domain | Domain only | Any I/O, adapters, ports, system time |
| Secondary Adapter | External libs | Domain, Application |
| Repository | DB drivers | Domain, Application |
