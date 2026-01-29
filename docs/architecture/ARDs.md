ARD-001 (Updated): Capability tokens gate privileged operations

Status: Accepted

Decision
Privileged operations require explicit capabilities (unforgeable tokens). Privileges include:
	•	mutating domain state
	•	performing external side effects
	•	committing durable writes
	•	executing admin or system operations

Motivation
LLM-written code will cut corners. Capabilities are locks that cannot be bypassed by “good intentions.”

Rules
	•	Capabilities are created only by the framework.
	•	Capabilities are never constructed in application/domain code.
	•	Privileged methods must require a capability parameter or a context typed to include that capability.
	•	Capability checks must exist at runtime even if types exist (defense in depth).

Implementation guidance
	•	PolicyToken is a capability for state evolution.
	•	Add additional capabilities as needed: CommitCap, NetworkCap, AdminCap, RawQueryCap.

⸻

ARD-002 (Updated): Trust is enforced both statically and at runtime

Status: Accepted

Decision
Trust level is enforced in two ways:
	•	Compile-time: distinct context types (ExternalCtx, InternalCtx, SystemCtx)
	•	Runtime: trustLevel field inside the context for logging and runtime guards

Motivation
Type-level enforcement prevents accidental misuse; runtime enforcement provides auditing and catches any-casts or JS/TS escape hatches.

Rules
	•	APIs must accept the narrowest context type they can.
	•	Runtime guardrails must reject obviously invalid flows (for example, ExternalCtx invoking privileged operations).
	•	Trust level must be propagated and logged for every span and gateway call.

Implementation guidance
	•	ExternalCtx may call only Primary Ports.
	•	InternalCtx is required for Policies and Repositories.
	•	SystemCtx is required for administrative repositories and system-only operations.

⸻

ARD-003 (Updated): Promotion is explicit and centralized

Status: Accepted

Decision
Crossing from External trust to Internal trust is an explicit operation called promotion.

Motivation
Prevents “I forgot to validate/auth” from being a silent failure mode. Makes the safe path obvious to LLMs.

Rules
	•	Promotion may only occur in Primary Adapters (Ingress) after validation and authentication.
	•	Promotion attaches identity claims and capability scope.
	•	Promotion must be recorded in trace logs (as an event/span annotation).

Implementation guidance
	•	Provide promoteExternalToInternal(externalCtx, assertions) returning InternalCtx.
	•	Assertions include: validated input, authenticated principal, authorization result, capability grant list.

⸻

ARD-004 (Updated): Hexagon boundary roles are strict and named

Status: Accepted

Decision
All code is classified into boundary roles with strict rules:
	•	Ingress (Primary Adapter)
	•	Application (Interaction / Application Service)
	•	Domain (Policy, Entities, Value Objects)
	•	Egress (Secondary Adapter)
	•	Persistence (Repository) as a specialized Egress

Motivation
Named roles make enforcement possible and reduce ambiguity for LLM authors.

Rules
	•	Ingress can parse and sanitize, then invokes Application via Primary Ports.
	•	Application orchestrates: reads, policy execution, writes.
	•	Domain is pure: no side effects, no external calls.
	•	Egress performs side effects only through adapters.
	•	Persistence is egress with stricter restrictions than other gateways.

Implementation guidance
	•	Directory layout should reflect roles (for grep/test enforcement).
	•	Add test-time checks to ban forbidden imports/APIs per role.

⸻

ARD-005 (Updated): Side effects only via Secondary Ports and Adapters

Status: Accepted

Decision
All side effects must go through declared Secondary Ports implemented by Secondary Adapters.

Motivation
Centralizes observability, retry policies, timeout rules, and security checks. Makes auditing tractable.

Rules
	•	No I/O in Policies or Domain objects.
	•	Interactions may perform side effects only by calling Ports (interfaces), not concrete adapters directly.
	•	Adapters must wrap calls with tracing/logging and context checks.

Implementation guidance
	•	Maintain BaseGateway for general egress.
	•	Repositories are separate (see ARD-011).

⸻

ARD-006 (Updated): Time and randomness are ports, not globals

Status: Accepted

Decision
Access to time and randomness must go through injected ports, not Date.now/new Date/Math.random or system globals.

Motivation
Determinism, testability, and preventing LLMs from grabbing globals.

Rules
	•	Domain and Policy code must never call system time directly.
	•	Interactions may access ClockPort via context or dependency injection.
	•	Test suite must fail if forbidden time/random APIs appear in protected directories.

Implementation guidance
	•	Provide ClockPort with now() and optionally monotonic time.
	•	Provide RandomPort where needed, seeded and controllable.

⸻

ARD-007 (Updated): Parameterization is mandatory for persistence

Status: Accepted

Decision
Persistence operations must be parameterized; building executable queries/commands from strings is forbidden by default.

Motivation
This is the structural fix for injection classes of bugs and accidental footguns.

Rules
	•	Repositories do not expose raw query execution methods in Internal trust.
	•	All queries must be expressed through parameterized APIs or a query builder that guarantees parameter binding.
	•	Raw SQL/Cypher is allowed only behind System trust with a dedicated capability.

Implementation guidance
	•	BaseRepository must not have any method that takes arbitrary query strings.
	•	Provide AdminRepository or MigrationRepository that requires SystemCtx and RawQueryCap.

⸻

ARD-008 (Updated): CQRS separation is enforced by capabilities

Status: Accepted

Decision
Reads and writes are separated using both structure and capability scope.

Motivation
Prevents accidental mutations during queries and supports clean projections/read models.

Rules
	•	Query Interactions run without mutation/commit capabilities.
	•	Command Interactions may grant commit capability only after successful policy execution.
	•	Policies never run in Query contexts.

Implementation guidance
	•	Provide QueryCtx type that is Internal but has no CommitCap and no PolicyToken access.
	•	Provide CommandCtx type that includes CommitCap when appropriate.

⸻

ARD-009 (Updated): Egress cannot initiate domain work

Status: Accepted

Decision
Secondary Adapters must not call back into Application/Domain logic.

Motivation
Avoids hidden control flow, makes tracing and reasoning reliable.

Rules
	•	Gateways and Repositories are leaf dependencies from the perspective of the hexagon.
	•	Inbound events from external systems are modeled as Ingress adapters, not “callbacks” from egress.

Implementation guidance
	•	Queue consumers and cron triggers are Ingress.
	•	DB triggers should be treated as external ingress events if used at all.

⸻

ARD-010 (Updated): Enforcement happens at test time with forbidden-pattern checks

Status: Accepted

Decision
The test suite must fail fast if forbidden APIs or imports appear in restricted layers.

Motivation
You’re solo; CI is not always tight. Local test runs should instantly catch violations.

Rules
	•	Domain/Policy: forbid time globals, randomness globals, filesystem, networking, raw SQL strings.
	•	Application: forbid direct DB clients; must go through ports.
	•	Egress/Persistence: allow I/O libraries but require adapter wrappers.

Implementation guidance
	•	Add a test that scans source directories for forbidden tokens and fails with a clear message.
	•	Maintain an allowlist with explicit comments for exceptions.

⸻

ARD-011 (New): Persistence is a distinct adapter type with stricter constraints

Status: Accepted

Decision
Persistence adapters are distinct from general gateways. Repositories get their own base class and rules.

Motivation
Databases are state authorities and accept expressive languages. They need stronger constraints to prevent whole-system compromise.

Rules
	•	Use BaseRepository for persistence adapters (SQL, graph DB, KV stores).
	•	BaseRepository APIs are structured and typed; no arbitrary query execution in Internal contexts.
	•	Raw query execution is restricted to System contexts behind a capability.

Implementation guidance
	•	Introduce BaseRepository with:
	•	safeExecute wrappers like gateways
	•	mandatory parameterization enforcement
	•	standard CRUD primitives keyed by IDs and typed fields
	•	Provide a separate AdminRepository or MigrationRepository for schema/raw operations.

⸻

ARD-012 (New): Trust type hierarchy and logging are both required

Status: Accepted

Decision
Context types encode trust and allowed operations; the runtime context also includes trustLevel and capability inventory for observability.

Motivation
Compile-time safety plus operational clarity.

Rules
	•	Every span/log includes: traceId, trustLevel, component name.
	•	Promotion emits an explicit trace event.
	•	Any attempt to use a System-only capability in non-System context must throw at runtime, even if someone casts.

Implementation guidance
	•	Keep a small set of context shapes:
	•	ExternalCtx
	•	InternalCtx (read-only)
	•	CommandCtx (internal + commit)
	•	SystemCtx
	•	Make capability checks centralized and consistent.