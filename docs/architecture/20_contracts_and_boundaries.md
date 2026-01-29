20 — Contracts and Boundaries (Ṛta Framework)

This document defines the enforceable rules of Ṛta: what code is allowed to do, what is forbidden, and how we detect violations.

Goal: turn the ARDs into mechanical constraints so LLM-written code defaults to safe architecture.

⸻

1) Core Contracts

Contract: Governed Execution

Definition
Application code does not “just run.” The framework manages execution to ensure:
	•	traceability
	•	authority checks
	•	determinism boundaries
	•	provenance recording

Enforcement
	•	All entrypoints must be Primary Adapters.
	•	All work must run under an explicit context.
	•	No privileged operation occurs without capabilities.

⸻

Contract: Context Propagation

Definition
Every meaningful operation accepts an explicit context and forwards it unchanged (except explicit promotion).

Rules
	•	No globals for context.
	•	No hidden ambient context.
	•	No “create a new ctx mid-flight” except at ingress and explicit promotion boundaries.

Enforcement
	•	Runtime: missing context is a hard error in tracing/log wrappers.
	•	Tests: boundary checks ensure core APIs always require ctx.

⸻

Contract: Determinism Boundary

Definition
Domain logic must be deterministic; side effects are isolated.

Rules
	•	Policies and domain objects must not:
	•	perform I/O
	•	read system time
	•	use randomness
	•	call external services
	•	call secondary adapters
	•	UseCases may orchestrate I/O through ports/adapters only.

Enforcement
	•	Test-time structural compliance in domain directories.
	•	Boundary import checks.

⸻

Contract: Mutation Authorization

Definition
Domain state changes only occur through Evolutions authorized by Policies.

Rules
	•	Domain objects are immutable.
	•	The only valid mutation mechanism is evolve, which requires PolicyToken.
	•	Policies propose Evolutions; the framework applies them and records provenance.

Enforcement
	•	Type-level: evolve requires PolicyToken parameter.
	•	Runtime: evolve throws if token missing.
	•	Tests: forbid direct field writes and setters in domain layer.

⸻

Contract: Side Effect Containment

Definition
All side effects must pass through outbound adapters (Gateways and Repositories).

Rules
	•	Policies cannot call outbound adapters.
	•	UseCases cannot call infrastructure libraries directly.
	•	Adapters cannot call back into domain/application orchestration.

Enforcement
	•	Boundary import checks.
	•	Adapter base classes require safeExecute wrappers.

⸻

2) Boundary Roles (Strict Layering)

Ṛta code is classified into roles. Each role has allowed dependencies and forbidden behaviors.

Roles:
	•	Primary Adapter (Ingress)
	•	Application (UseCase)
	•	Domain (Policy, Entities, Value Objects)
	•	Secondary Adapter (Egress/Gateway)
	•	Persistence (Repository)
	•	System (Admin-only)

⸻

3) May-Call Matrix (The Law)
| From Layer | May Call | Must Not Call |
| :--- | :--- | :--- |
| Primary Adapter | ContextFactory, UseCases (Primary Ports) | Domain logic, Policies, Repositories, Secondary Adapters, DB drivers |
| UseCase | Policies, Ports, Secondary Adapters, Repositories | DB drivers directly, raw network libraries directly |
| Domain | Domain only | Any I/O, Ports, Secondary Adapters, Repositories, system time, randomness |
| Secondary Adapter | External libs, safeExecute | Domain or Application orchestration |
| Repository | DB drivers, safeExecute | Domain or Application orchestration |
| System | Everything (explicit) | Nothing (but must be loud + capability gated) | |
Notes
	•	“May Call” means direct imports and invocation are permitted.
	•	“Must Not Call” is enforced via tests and code review.

⸻

4) Trust Boundaries and Context Types

Trust model
	•	ExternalCtx is untrusted and only valid within ingress adapters.
	•	InternalCtx is trusted for deterministic logic and safe reads.
	•	CommandCtx is InternalCtx with CommitCap, enabling durable writes.
	•	SystemCtx is admin-only and enables privileged operations like raw DB queries.

⸻

Contract: External code cannot touch the interior

Rules
	•	ExternalCtx must never reach a Policy or Repository.
	•	Primary Adapter must promote ExternalCtx before calling UseCases that do real work.

Enforcement
	•	Type-level: Policy.execute requires InternalCtx.
	•	Runtime: policies and repositories assert ctx.trustLevel is not external.

⸻

Contract: Promotion is explicit

Rules
	•	Promotion happens only in Primary Adapters.
	•	Promotion is the only legal way to move External → Internal.
	•	Promotion grants capabilities (never the reverse).

Enforcement
	•	ContextFactory is the only module allowed to construct Internal/Command/System contexts.
	•	Promotion emits a trace annotation.

⸻

5) Capability Boundaries

Contract: Capabilities are core-owned

Rules
	•	No application code constructs capabilities.
	•	Capabilities are never serialized and rehydrated as raw values (no “string token” forgery).
	•	CapabilityBag is the only storage mechanism in context.

Enforcement
	•	Capabilities are unexported constructors.
	•	Runtime guards require real instances, not string identifiers.

⸻

Minimum capability gates
| Operation | Required Context | Required Capability |
| :--- | :--- | :--- |
| Policy execution that evolves state | InternalCtx | PolicyToken (held privately by Policy) |
| Durable repository write | CommandCtx | CommitCap |
| Raw query execution | SystemCtx | RawQueryCap |
| Admin/system operations | SystemCtx | AdminCap (optional but recommended) |
6) Persistence Contract (Parameterization and Safe Queries)

Contract: Parameterization is mandatory

Rules
	•	Repositories must not accept arbitrary query strings in Internal/Command contexts.
	•	Repository APIs must be structured:
	•	getById(id)
	•	save(entity)
	•	findByIndex(field, value)
	•	Query arguments must be typed and validated (IDs, enums, constrained primitives).

Enforcement
	•	No method in BaseRepository accepts a string query.
	•	Raw query execution exists only in AdminRepository and requires SystemCtx + RawQueryCap.
	•	Tests scan for banned repository method signatures and banned raw query calls.

⸻

Contract: Raw queries are system-only escape hatches

Rules
	•	Raw SQL/Cypher allowed only for:
	•	migrations
	•	diagnostics
	•	admin repair tasks
	•	Must be “loud”: located in system folder and named explicitly.

Enforcement
	•	RawQueryCap is not grantable by normal promotion.
	•	Only system ingress can create SystemCtx.

⸻

7) Time and Randomness Contract

Contract: No global time/random in deterministic layers

Rules
	•	Domain and Policy code must not call:
	•	Date.now
	•	new Date
	•	Math.random
	•	Time must come from ClockPort (or core clock module) passed through the application layer.

Enforcement
	•	ForbiddenScan fails tests if those tokens appear in domain/policy directories.
	•	Optional: lint rule for immediate feedback.

⸻

8) Adapter Contract (No Re-entrancy)

Contract: Adapters are leaf dependencies

Rules
	•	Secondary Adapters and Repositories must not invoke Policies or UseCases.
	•	Adapters may emit logs/metrics only.
	•	Adapters return data, not behavior.

Enforcement
	•	BoundaryCheck forbids adapter imports of domain/application modules.

⸻

9) CQRS Contract

Command side

Rules
	•	Commands may run policies and evolve state.
	•	Commands may persist changes (requires CommandCtx + CommitCap).
	•	Commands may emit events (through gateways) after commit.

Query side

Rules
	•	Queries must not:
	•	execute policies
	•	evolve state
	•	write to repositories
	•	Queries may call read-only repository methods if explicitly marked safe.

Enforcement
	•	Use QueryUseCase base type or Query folder rules + Structural Tests.

⸻

10) Enforcement Mechanisms (How rules become real)

Type-level locks
	•	ExternalCtx, InternalCtx, CommandCtx, SystemCtx types restrict who can call what.
	•	evolve requires PolicyToken.
	•	repository writes require CommandCtx.

Runtime guards
	•	assertNotExternal(ctx) in policies and repositories
	•	requireCommit(ctx) for repository writes
	•	requireRawQuery(ctx) for admin repository methods

Test-time scans
	•	ForbiddenScan/StructureTests: banned APIs in domain/policy
	•	BoundaryCheck: forbidden imports across layers
	•	RepositorySignatureCheck: rejects raw query methods outside admin persistence

⸻

11) “Sharp Edge” Allowlist Policy

Principle
Exceptions are allowed, but must be explicit, rare, and documented.

Rules
	•	Allowlist entries must:
	•	reference a specific file path
	•	state a reason
	•	name an expiration or review date
	•	Allowlist requires SystemCtx or test-only usage where possible.

⸻

12) Definition of Done for this document

This document is “done” when:
	•	the May-Call matrix maps cleanly to folders
	•	every contract has at least one enforcement mechanism (types, runtime, or tests)
	•	ForbiddenScan and BoundaryCheck rules are specified enough to implement
	•	repositories are structurally parameterized with a System-only raw query escape hatch