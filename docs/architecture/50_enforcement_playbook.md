50 — Enforcement Playbook (Ṛta Framework)

This document specifies the mechanisms that enforce the architecture defined in:
	•	10_parts_list.md
	•	20_contracts_and_boundaries.md
	•	30_kernel_api.md
	•	40_execution_flows.md

The goal is simple:
	•	If you follow the base classes and kernel APIs, you are already locked in.
	•	If you bypass the base classes, you must “carve your own drivers out of wood,” and violations become visible and fail-fast.

⸻

1) Enforcement Model

Ṛta uses four enforcement channels, in order of preference:
	1.	Inheritance enforcement
	2.	Type-level enforcement
	3.	Runtime enforcement
	4.	Test-time structural enforcement

A rule is “real” only if it is enforced by at least two channels.

⸻

2) Inheritance Enforcement

The primary enforcement mechanism is that “normal code” is written by inheriting kernel base classes that already contain the correct rails.

2.1 Primary Adapter Enforcement: BaseUseCase and BasePrimaryAdapter

Required properties enforced by inheritance:
	•	The context root is created at the primary adapter.
	•	ExternalCtx exists only here.
	•	Promotion occurs only here.
	•	Root span exists only here.

Locked-in behaviors:
	•	External input parsing and validation occurs before promotion.
	•	A traceId is created at the boundary.
	•	Failure is logged at the boundary.

Bypass cost:
	•	If a developer does not extend BaseUseCase/BasePrimaryAdapter, they must reimplement:
	•	trace root creation
	•	promotion constraints
	•	consistent structured logging
	•	error boundary behavior

⸻

2.2 Application Enforcement: BaseComponent

Required properties enforced by inheritance:
	•	Every UseCase/use-case execution is traced and logged.
	•	Errors are captured, traced, and rethrown.
	•	Context is propagated.

Locked-in behaviors:
	•	Start/Completed/Failed logs are standardized.
	•	Child spans are automatically created.
	•	The only “hole” is _run(ctx, input).

Bypass cost:
	•	If a developer does not extend BaseComponent, they must reimplement:
	•	span lifecycle
	•	logging contract
	•	error boundary
	•	consistent ctx propagation

⸻

2.3 Domain Enforcement: DecisionPolicy + BaseValueObject

Required properties enforced by inheritance:
	•	Policies are the only author of evolutions.
	•	Value Objects can only evolve through _evolve with PolicyToken.
	•	Provenance history is always recorded.

Locked-in behaviors:
	•	Policy holds a PolicyToken internally (kernel-created).
	•	Policy executes imperative logic, then applies evolutions with attribution.
	•	BaseValueObject validates invariants on construct and evolve.
	•	BaseValueObject appends provenance history on every evolution.

Bypass cost:
	•	If a developer does not extend DecisionPolicy/BaseValueObject, they must reimplement:
	•	mutation authorization
	•	provenance logging
	•	invariant enforcement
	•	deterministic policy constraints

⸻

2.4 Secondary Adapter Enforcement: BaseSecondaryAdapter

Required properties enforced by inheritance:
	•	All external calls are traced and logged uniformly.
	•	Failures are recorded with traceId.

Locked-in behaviors:
	•	safeExecute wraps every call.
	•	operationName is explicit in spans.

Bypass cost:
	•	If a developer does not extend BaseSecondaryAdapter, they must reimplement:
	•	safe execution wrapper
	•	trace and logging discipline
	•	consistent error capture

⸻

2.5 Persistence Enforcement: BaseRepository and AdminRepository

Required properties enforced by inheritance:
	•	Writes require CommandCtx + CommitCap.
	•	Raw queries require SystemCtx + RawQueryCap.
	•	Normal repositories do not expose arbitrary string query APIs.

Locked-in behaviors:
	•	Repository save paths call requireCommit(ctx).
	•	AdminRepository raw execution paths call requireRawQuery(ctx).
	•	Parameterization is enforced by API shape (structured methods).

Bypass cost:
	•	If a developer does not extend BaseRepository, they must reimplement:
	•	commit gating
	•	raw query gating
	•	safeExecute wrappers
	•	parameterization guardrails

⸻

3) Type-Level Enforcement

3.1 Privilege types

The kernel defines distinct context types:
	•	ExternalCtx
	•	InternalCtx
	•	CommandCtx
	•	SystemCtx

Enforced constraints:
	•	Policies require InternalCtx.
	•	Repository writes require CommandCtx.
	•	Admin/raw persistence requires SystemCtx.

This prevents accidental misuse at compile time.

⸻

3.2 Capability presence

Capabilities live in ctx.capabilities (CapabilityBag) and are checked at compile time where possible by requiring narrower ctx types, and at runtime via CapabilityBag.require.

Minimum capability gates:
	•	CommitCap gates durable writes
	•	RawQueryCap gates raw DB execution
	•	PolicyToken gates VO evolution (held privately by DecisionPolicy)

⸻

4) Runtime Enforcement

Type locks are not enough in TypeScript because any-casts exist. Runtime enforcement exists to make bypassing loud.

4.1 Context assertions

Runtime guards are called at privileged boundaries:
	•	assertNotExternal(ctx) at policies and repositories
	•	requireCommit(ctx) at any repository write path
	•	requireSystem(ctx) and requireRawQuery(ctx) at admin persistence

Failure mode:
	•	throw an explicit kernel error type (BoundaryViolationError, MissingCapabilityError, UnauthorizedContextError)

⸻

4.2 Mutation authorization

BaseValueObject._evolve enforces:
	•	token must be present
	•	reason must be present
	•	invariants validated
	•	provenance appended

Failure mode:
	•	throw UnauthorizedEvolutionError or AgentGuidanceError (your existing pattern)

⸻

4.3 Clock enforcement

Runtime cannot reliably stop Date.now usage without instrumentation, so runtime enforcement is not the primary mechanism here.

Instead, clock enforcement is primarily test-time structural enforcement (see section 6), backed by a design rule:
	•	Domain and policy code must depend on RitaClock, never system time.

⸻

5) Linting Policy

Linting is not a security boundary. It is a fast feedback tool.

Linting is used for:
	•	formatting consistency
	•	import ordering
	•	obvious footguns (optional)

Linting is not used for:
	•	architectural enforcement
	•	security enforcement
	•	privilege boundary enforcement

Architectural enforcement lives in tests and runtime checks, not lint.

⸻

6) Test-Time Structural Enforcement

The architecture is enforced mechanically by tests that fail fast and do not require human review.

6.1 Architecture tests (non-negotiable)

These are tests that validate the structure of the codebase, independent of business behavior.

Required test suites:

A) ForbiddenScan
Scans for forbidden APIs/usages by folder scope.

Minimum forbidden patterns:
	•	In domain and policy folders:
	•	Date.now
	•	new Date
	•	Math.random
	•	direct imports of fs, http, net, child_process
	•	direct imports of DB drivers or ORMs
	•	In application folders:
	•	direct imports of DB drivers or ORMs
	•	Outside persistence folders:
	•	any import of DB drivers or ORMs
	•	Outside system folders:
	•	any raw query execution API usage (as defined by your AdminRepository surface)

B) BoundaryCheck
Validates import boundaries between layers.

Minimum boundary constraints:
	•	Domain must not import adapters (secondary adapters/repositories)
	•	Policies must not import secondary adapters/repositories
	•	Adapters must not import domain/application orchestration
	•	Primary Adapters must not import repositories directly (must call application ports/UseCases)

C) RepositorySignatureCheck
Prevents accidental introduction of raw query surfaces.

Rules:
	•	BaseRepository must not expose methods that accept arbitrary query strings.
	•	AdminRepository raw execution must require SystemCtx + RawQueryCap.

⸻

6.2 Behavioral test policy (TDD/BDD/etc.)

This is how we classify and enforce testing scope. Each test type has allowed dependencies.

**Golden Rule:** Every line of code committed to the repository must be covered by an automated test. Goal: **100% Coverage**.

Unit tests
Targets:
	•	DecisionPolicy logic (decide)
	•	BaseValueObject validation logic
	•	Evolution application correctness
	•	Provenance correctness

Rules:
	•	no gateways
	•	no repositories
	•	no system context
	•	deterministic inputs only
	•	clock must be RitaClock-controlled if time is involved

Enforcement:
	•	unit tests should run in-memory with fake ports
	•	ForbiddenScan should keep these layers pure

⸻

Integration tests
Targets:
	•	BaseComponent orchestration with real adapter stubs
	•	BaseRepository implementations against a real DB (or containerized DB)
	•	BaseSecondaryAdapter implementations against a mocked external service

Rules:
	•	may use real persistence drivers only inside repository implementations
	•	may use real HTTP clients only inside gateway implementations
	•	must use InternalCtx/CommandCtx (never ExternalCtx)

Enforcement:
	•	BoundaryCheck ensures dependencies flow through ports

⸻

End-to-end tests
Targets:
	•	BaseUseCase/BasePrimaryAdapter entrypoints
	•	Full flow: External input → promotion → UseCase → Policy → Repository/SecondaryAdapter

Rules:
	•	must start from ExternalCtx created at ingress
	•	must show promotion in logs/traces
	•	must show commit gating for writes
	•	must verify stable trace shape (section 6.3)

⸻

Contract tests (ports/adapters)
Targets:
	•	SecondaryPort contract compliance by adapters
	•	PrimaryPort/UseCase contract behavior

Rules:
	•	verify adapter behavior without embedding business rules
	•	ensure error handling and tracing behavior is correct

⸻

6.3 Trace shape validation tests

Trace tests validate that runtime execution matches 40_execution_flows.md.

Minimum required trace shape:
	•	UseCase span is root
	•	Component span is child
	•	Policy span is under component
	•	Secondary Adapter/Repository spans are under component, never under policy

Forbidden trace relationships:
	•	Policy span → Secondary Adapter/Repository span
	•	Secondary Adapter/Repository span → Component span (adapters cannot initiate orchestration)

Failure mode:
	•	tests fail with a trace tree excerpt identifying the offending parent-child relationship

⸻

7) Enforcement Mapping: 10/20/30/40

This section ties the doc set together mechanically.

10_parts_list.md is enforced by
	•	Inheritance enforcement: all “parts” are only useful if inherited/used
	•	BoundaryCheck: prevents “shadow parts” that violate layering
	•	RepositorySignatureCheck: prevents new persistence escape hatches

Minimum operational rule:
	•	If a new kernel concept is introduced, it must be added to 10 before merging.

⸻

20_contracts_and_boundaries.md is enforced by
	•	BoundaryCheck (imports)
	•	ForbiddenScan (banned APIs by folder)
	•	CapabilityBag.require and runtime guards (privileged boundaries)
	•	Trace shape validation tests (flow boundaries)

⸻

30_kernel_api.md is enforced by
	•	Type-level enforcement:
	•	ctx types required by API signatures
	•	PolicyToken required by BaseValueObject._evolve
	•	Runtime enforcement:
	•	capability requirement checks
	•	privilege checks
	•	Architecture tests:
	•	ensure only ContextFactory constructs contexts
	•	ensure capabilities cannot be constructed in app code

⸻

40_execution_flows.md is enforced by
	•	Trace shape validation tests
	•	Integration/E2E tests that assert:
	•	promotion appears before privileged actions
	•	commit gating occurs before writes
	•	policies do not perform I/O

⸻

8) Exception Policy

Exceptions are allowed, but must be explicit and visible.

Allowed mechanisms:
	•	Allowlist entries for ForbiddenScan and BoundaryCheck with:
	•	file path
	•	rule id
	•	reason
	•	expiry date

Hard rule:
	•	expired allowlist entries fail tests

System-only escape hatch:
	•	SystemCtx + AdminRepository + RawQueryCap
	•	must live in system folder and be named explicitly as administrative

⸻

9) Definition of Done

This enforcement system is “done” when:
	•	a developer can only do the easy thing by inheriting rails
	•	privileged actions fail fast when attempted incorrectly
	•	architectural drift causes tests to fail locally
	•	traces reflect the canonical execution flows
	•	raw persistence and system operations are visibly isolated and capability-gated