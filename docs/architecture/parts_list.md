Ṛta Framework Parts List (Minimum V1)

Goal: the smallest set of kernel types/classes/interfaces that make ARDs 001–012 true (capabilities, trust contexts, promotion, strict boundaries, repositories stricter than gateways, time-as-port, and test-time enforcement).

This is a “bill of materials” for what you and the agent implement next.

⸻

0) Folder taxonomy (enforced by convention + tests)
	•	src/kernel
	•	ctx
	•	auth
	•	observability
	•	domain
	•	app
	•	ports
	•	adapters
	•	enforcement
	•	src/app
	•	ingress
	•	interactions
	•	domain
	•	gateways
	•	repositories
	•	system

Enforcement: a test scans these folders for forbidden imports/APIs per layer.

⸻

1) Context family (types + runtime field)

1.1 TrustLevel

Kind: type + runtime field
Layer: kernel/ctx
Purpose: explicit trust zone
Minimum:
	•	values: external | internal | system

1.2 BaseCtx

Kind: interface/type
Layer: kernel/ctx
Fields:
	•	traceId: string
	•	trustLevel: TrustLevel
	•	request metadata: optional record
	•	capabilities: CapabilityBag (see section 2)

1.3 ExternalCtx, InternalCtx, CommandCtx, SystemCtx

Kind: types (extend BaseCtx)
Layer: kernel/ctx
Purpose: compile-time semantic locks + runtime observability

Rules enforced by types:
	•	ExternalCtx: only valid at ingress + before promotion
	•	InternalCtx: safe for policies and reads
	•	CommandCtx: internal + commit/write allowed
	•	SystemCtx: admin-only operations

Implementation guidance:
	•	keep these as structural types, not classes
	•	never allow construction outside kernel factory functions

1.4 ContextFactory

Kind: kernel class/module
Layer: kernel/ctx
Responsibilities:
	•	createExternalCtx(): ExternalCtx
	•	promote(externalCtx, authResult, grants): InternalCtx or CommandCtx
	•	elevateToSystem(internalCtx, proof): SystemCtx (optional, likely rare)

Notes:
	•	promotion attaches identity/principal info and capability grants
	•	promotion emits a trace event annotation

⸻

2) Capabilities (authority tokens)

2.1 Capability

Kind: marker interface
Layer: kernel/auth
Purpose: capability-based security primitives

Minimum capabilities:
	•	PolicyToken (authorizes state evolution)
	•	CommitCap (authorizes durable writes)
	•	RawQueryCap (authorizes raw SQL/cypher, System-only)
	•	ClockCap optional (or just enforce ClockPort injection)

2.2 CapabilityBag

Kind: class
Layer: kernel/auth
Responsibilities:
	•	holds capability instances keyed by symbol
	•	has(type): boolean
	•	require(type): throws if missing

Implementation guidance:
	•	capability constructors are not exported
	•	provide kernel-only factory methods

2.3 CapFactory

Kind: module/class
Layer: kernel/auth
Responsibilities:
	•	makePolicyToken(): PolicyToken (kernel-only)
	•	makeCommitCap(): CommitCap (only granted on promotion to CommandCtx)
	•	makeRawQueryCap(): RawQueryCap (SystemCtx only)

⸻

3) Observability kernel

3.1 Tracer

Kind: module/class
Layer: kernel/observability
Responsibilities:
	•	startSpan(name, ctx) → Span
	•	spans include traceId and trustLevel
	•	recordException, end

3.2 Logger

Kind: module/class
Layer: kernel/observability
Responsibilities:
	•	debug/info/error(message, structuredFields)
	•	always include traceId, component name, trustLevel

Minimum fields to standardize:
	•	traceId
	•	component
	•	trustLevel
	•	spanId (optional)
	•	jobId/artifactId (later)

⸻

4) Domain state and decision system

4.1 BaseValueObject

Kind: abstract class
Layer: kernel/domain
Responsibilities:
	•	immutable data
	•	validate on construct and evolve
	•	provenance history appended on evolve

Minimum fields:
	•	data (immutable)
	•	provenance:
	•	createdAt
	•	history entries: at, reason, diff, byPolicy

4.2 Evolve capability gate

Kind: method contract
Layer: kernel/domain
Rule:
	•	evolve must require PolicyToken capability

Implementation guidance:
	•	evolve(changes, reason, policyToken): new instance
	•	policyToken must be unforgeable and kernel-created

4.3 Policy

Kind: abstract class
Layer: kernel/domain
Responsibilities:
	•	pure deterministic decision logic
	•	returns Evolutions (data-only)
	•	framework applies evolutions and logs attribution

Minimum API:
	•	decide(target, context) → list of Evolution
	•	execute(ctx: InternalCtx, target, context) → new target

Important:
	•	Policy holds PolicyToken internally (kernel-created)
	•	Policy cannot do I/O; enforcement via tests + no access to gateways

4.4 Evolution

Kind: type
Layer: kernel/domain
Fields:
	•	changes: partial of target state
	•	reason: string

Framework is responsible for attaching:
	•	policy name
	•	timestamp

⸻

5) Application layer base (Interactions)

5.1 Interaction (Application Service)

Kind: abstract class
Layer: kernel/app
Responsibilities:
	•	orchestrate reads, policies, writes
	•	owns control flow and side effects
	•	must be traced and logged

Minimum API:
	•	run(ctx, input) → output (implemented by app)
	•	execute wrapper does tracing/logging and calls run

Context rules:
	•	typical interactions should accept InternalCtx or CommandCtx
	•	ingress creates ExternalCtx then promotes before calling interactions

5.2 QueryInteraction

Kind: optional abstract class (but recommended even in minimum)
Layer: kernel/app
Purpose: CQRS separation by capability
Rules:
	•	accepts InternalCtx without CommitCap
	•	forbidden to call write operations

You can keep this minimal by:
	•	same base class, but separate directory and tests enforce no writes

⸻

6) Ports (interfaces owned by application/domain)

6.1 Primary Port

Kind: interface
Layer: kernel/ports
Purpose: stable “what the system does” contract

Minimum guidance:
	•	ports are expressed as interaction input/output DTOs + method signatures
	•	adapters implement ports

In practice for minimum V1:
	•	you can treat Interaction subclasses as primary ports, but document that they are port implementations

6.2 Secondary Ports

Kind: interfaces
Layer: kernel/ports
Purpose: what the system needs from infrastructure

Minimum list:
	•	ClockPort: now()
	•	UserPort or external service ports (app-specific)
	•	Repository ports for persistence (app-specific)

Rule:
	•	application layer depends on ports; adapters implement ports

⸻

7) Adapters (egress) with strict split

7.1 BaseGateway

Kind: abstract class
Layer: kernel/adapters
Purpose: outbound adapter for general side effects (HTTP APIs, queues, LLM providers)

Minimum API:
	•	safeExecute(ctx, operationName, fn) wraps tracing/logging/errors
	•	requires ctx not ExternalCtx (runtime guard)

7.2 BaseRepository (NEW, stricter than BaseGateway)

Kind: abstract class
Layer: kernel/adapters
Purpose: persistence adapter with mandatory parameterization and restricted surface

Minimum rules:
	•	no method accepts raw query strings in normal Internal/Command contexts
	•	operations are structured and typed: getById, save, findByIndex, etc.
	•	safeExecute wrapper required
	•	writes require CommitCap (in CommandCtx)

Minimum API:
	•	safeExecute like gateways
	•	requireCommit(ctx) guard for writes
	•	optional: requireRawQuery(ctx: SystemCtx) for admin raw operations

Admin-only escape hatch:
	•	AdminRepository subclass or separate adapter that requires SystemCtx and RawQueryCap for raw query execution

⸻

8) Ingress base (primary adapters)

8.1 BaseIngress

Kind: abstract class
Layer: kernel/adapters or kernel/app (either is fine, but keep consistent)
Purpose: enforce “dirty input only here” and handle promotion

Responsibilities:
	•	parse external input
	•	validate and authenticate
	•	create ExternalCtx
	•	promote to Internal/Command context
	•	invoke Interaction

Minimum API:
	•	handle(input) → output
	•	internally: ctxFactory.createExternalCtx, ctxFactory.promote, interaction.execute

Note:
	•	your existing BaseInteraction is close to this; rename and align semantics

⸻

9) Enforcement tooling (test-time locks)

9.1 Forbidden API scanner

Kind: test utility
Layer: kernel/enforcement
Purpose: fail fast locally when someone violates invariants

Minimum checks:
	•	In domain and policies: forbid Date.now, new Date, Math.random, fs, net/http clients, direct db clients, raw query string execution
	•	In application: forbid direct db client imports; must use ports
	•	In repositories: forbid unparameterized query helpers (if detectable) and forbid accepting raw SQL strings in normal paths

9.2 Dependency boundary checks

Kind: optional test utility (recommended)
Purpose:
	•	ensure domain does not import adapters
	•	ensure ingress does not import repositories directly

Minimum:
	•	grep-based import boundary checks are fine for V1

⸻

10) Minimum “May Call” rules (write this into the doc as a contract)
	•	Ingress may call: ContextFactory, Interaction
	•	Interaction may call: Ports, Policies, Gateways, Repositories
	•	Policy may call: Domain only (Value Objects, Entities)
	•	Gateways may call: external libs, not domain orchestration
	•	Repositories may call: db drivers/query builders, not domain orchestration
	•	Domain objects may call: Domain only (and ClockPort only if explicitly injected, but prefer no time usage in domain)

⸻

11) App implementer checklist (what your agents will write)

For each feature, the agent will implement:
	•	an Ingress adapter (HTTP/CLI/event) that promotes ExternalCtx to Internal/CommandCtx
	•	one Interaction (application orchestration)
	•	one or more Policies (pure decision logic)
	•	domain state objects (Entity/ValueObject)
	•	one Gateway (if calling external service)
	•	one Repository (if persisting), using parameterized operations only

⸻

If you want the next doc after this, it should be:

A dependency matrix plus a “minimum skeleton repo layout” with filenames for each kernel part, so the agent can just create the files and start wiring.