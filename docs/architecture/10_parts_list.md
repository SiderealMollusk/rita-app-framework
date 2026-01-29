10 — Parts List (Ṛta Framework)

This document is the inventory of nouns in Ṛta.
If something exists in the kernel, it appears in the table below.

Rule:

If you add a new kernel concept, add it to the table before writing code.

⸻

1) Sacred Table — The 30-Second View

| Name | Kind | Layer | Purpose (1 line) |
| :--- | :--- | :--- | :--- |
| TrustLevel | Type | Kernel / Context | Runtime trust classification: external, internal, system |
| BaseCtx | Interface | Kernel / Context | Common execution context (trace, trust, capabilities) |
| ExternalCtx | Type | Kernel / Context | Untrusted request context (ingress only) |
| InternalCtx | Type | Kernel / Context | Trusted, read-only application context |
| CommandCtx | Type | Kernel / Context | Trusted, write-capable context |
| SystemCtx | Type | Kernel / Context | Admin/system-only context |
| ContextFactory | Module | Kernel / Context | Creates and promotes contexts between trust levels |
| Capability | Interface | Kernel / Auth | Marker for privileged authority tokens |
| CapabilityBag | Class | Kernel / Auth | Stores and validates capabilities |
| PolicyToken | Capability | Kernel / Auth | Authorizes domain state evolution |
| CommitCap | Capability | Kernel / Auth | Authorizes durable writes |
| RawQueryCap | Capability | Kernel / Auth | Authorizes raw DB queries (system-only) |
| Tracer | Service | Kernel / Observability | Creates and manages spans |
| Span | Type | Kernel / Observability | Represents a traced execution unit |
| Logger | Service | Kernel / Observability | Structured logging with context |
| BaseValueObject | Abstract Class | Kernel / Domain | Immutable domain state with provenance |
| Policy | Abstract Class | Kernel / Domain | Pure decision logic that proposes evolutions |
| Evolution | Type | Kernel / Domain | Data-only state change request |
| Interaction | Abstract Class | Kernel / Application | Orchestrates use cases and side effects |
| QueryInteraction | Abstract Class | Kernel / Application | Read-only interaction (CQRS) |
| PrimaryPort | Interface | Kernel / Ports | Inbound contract into application logic |
| SecondaryPort | Interface | Kernel / Ports | Outbound contract to infrastructure |
| ClockPort | Interface | Kernel / Ports | Time source abstraction |
| BaseGateway | Abstract Class | Kernel / Adapters | External system adapter (API, queue, LLM, etc.) |
| BaseRepository | Abstract Class | Kernel / Persistence | Parameterized persistence adapter |
| AdminRepository | Abstract Class | Kernel / Persistence | System-only raw DB access |
| BaseIngress | Abstract Class | Kernel / Adapters | External entrypoint (HTTP/CLI/Event) |
| ForbiddenScan | Tool | Kernel / Enforcement | Test-time forbidden API scanner |
| BoundaryCheck | Tool | Kernel / Enforcement | Test-time layer dependency validator |
2) Context System

TrustLevel

Kind: Type
Purpose: Runtime classification of how much the system trusts this execution.

Values:
	•	external
	•	internal
	•	system

Rules:
	•	Always present in logs and spans
	•	Used by runtime guards
	•	Mirrors compile-time context types

⸻

BaseCtx

Kind: Interface
Purpose: Shared execution context passed through all layers.

Minimum Fields:
	•	traceId
	•	trustLevel
	•	principal (optional)
	•	capabilities (CapabilityBag)
	•	request metadata (optional)

Enforcement:
	•	Must be created only by ContextFactory
	•	Must be passed explicitly, never global

⸻

ExternalCtx / InternalCtx / CommandCtx / SystemCtx

Kind: Types
Purpose: Compile-time semantic locks for trust zones.

Rules:
	•	ExternalCtx: ingress only, no policies, no repositories, no gateways
	•	InternalCtx: safe for reads and policy evaluation
	•	CommandCtx: includes CommitCap for durable writes
	•	SystemCtx: includes RawQueryCap and admin-only capabilities

⸻

ContextFactory

Kind: Module
Purpose: Only legal way to create and promote contexts.

Responsibilities:
	•	createExternalCtx()
	•	promoteToInternal(externalCtx, authResult, grants)
	•	promoteToCommand(internalCtx, grants)
	•	elevateToSystem(internalCtx, proof)

Enforcement:
	•	Emits trace event on promotion
	•	Attaches capability bag
	•	Sets trustLevel field

⸻

3) Capability System

Capability

Kind: Interface
Purpose: Marker for unforgeable authority tokens.

Rule:
	•	Capabilities are created only by kernel code

⸻

CapabilityBag

Kind: Class
Purpose: Stores and validates capabilities for a context.

Methods:
	•	has(CapType)
	•	require(CapType)

Enforcement:
	•	require throws at runtime if missing
	•	used by repositories, policies, and admin adapters

⸻

PolicyToken

Purpose: Authorizes domain evolution.

Used by:
	•	BaseValueObject.evolve
	•	Policy.execute

⸻

CommitCap

Purpose: Authorizes durable writes.

Used by:
	•	BaseRepository.save
	•	Any persistence operation that mutates state

⸻

RawQueryCap

Purpose: Authorizes raw query execution.

Used by:
	•	AdminRepository only
	•	SystemCtx required

⸻

4) Observability Kernel

Tracer

Purpose: Creates spans and propagates trace metadata.

Responsibilities:
	•	startSpan(name, ctx)
	•	attach trustLevel and traceId
	•	recordException
	•	end

⸻

Logger

Purpose: Structured logging.

Rules:
	•	Must always include:
	•	traceId
	•	component name
	•	trustLevel

⸻

5) Domain Layer

BaseValueObject

Purpose: Immutable domain state with provenance.

Responsibilities:
	•	validate on construct
	•	validate on evolve
	•	append provenance history

Rules:
	•	Cannot be mutated directly
	•	evolve requires PolicyToken
	•	Must remain deterministic

⸻

Evolution

Purpose: Data-only change request.

Fields:
	•	changes (partial domain data)
	•	reason (string)

Rule:
	•	Domain code returns Evolutions
	•	Framework applies them

⸻

Policy

Purpose: Pure decision logic.

Responsibilities:
	•	inspect target and context
	•	return list of Evolutions

Rules:
	•	No I/O
	•	No clock
	•	No randomness
	•	Holds PolicyToken internally
	•	Requires InternalCtx

⸻

6) Application Layer

Interaction

Purpose: Orchestrates reads, policies, and writes.

Responsibilities:
	•	call ports
	•	invoke policies
	•	decide when to commit

Rules:
	•	Must be traced
	•	Must not mutate domain directly
	•	Requires InternalCtx or CommandCtx

⸻

QueryInteraction

Purpose: CQRS read-only interaction.

Rules:
	•	Must not call repositories in write mode
	•	Must not invoke policies
	•	No CommitCap in context

⸻

7) Ports

PrimaryPort

Purpose: Inbound contract into the application.

Used by:
	•	Ingress adapters

Rule:
	•	Defines what the system does, not how

⸻

SecondaryPort

Purpose: Outbound contract to infrastructure.

Used by:
	•	Gateways
	•	Repositories

Rule:
	•	Application depends on ports, not adapters

⸻

ClockPort

Purpose: Time abstraction.

Rules:
	•	Domain must never access system time
	•	Application may use ClockPort only

⸻

8) Adapters

BaseIngress

Purpose: External boundary.

Responsibilities:
	•	parse input
	•	validate
	•	authenticate
	•	create ExternalCtx
	•	promote context
	•	invoke Interaction

Rules:
	•	Only place where “dirty” data is allowed

⸻

BaseGateway

Purpose: External system adapter.

Examples:
	•	HTTP APIs
	•	LLM providers
	•	Message queues

Rules:
	•	Must wrap calls in safeExecute
	•	Must not accept ExternalCtx
	•	Must not call domain/application logic

⸻

9) Persistence Layer

BaseRepository

Purpose: Safe, parameterized persistence adapter.

Responsibilities:
	•	structured CRUD operations
	•	enforce CommitCap for writes
	•	enforce parameterization

Rules:
	•	No raw query execution
	•	No string-based query APIs
	•	Requires CommandCtx for writes

⸻

AdminRepository

Purpose: System-only persistence escape hatch.

Rules:
	•	Requires SystemCtx
	•	Requires RawQueryCap
	•	Used for migrations and diagnostics only

⸻

10) Enforcement Tooling

ForbiddenScan

Purpose: Test-time API scanner.

Checks:
	•	Domain cannot import:
	•	fs
	•	http
	•	db clients
	•	Date.now
	•	Math.random
	•	Application cannot import DB clients
	•	Persistence cannot expose raw query APIs

⸻

BoundaryCheck

Purpose: Dependency validator.

Checks:
	•	Domain does not import adapters
	•	Ingress does not import repositories
	•	Policies do not import gateways

⸻

11) Layer Call Rules (Summary)
| Layer | May Call | Must Not Call |
| :--- | :--- | :--- |
| Ingress | Interaction, ContextFactory | Domain, Repository, Gateway |
| Application | Policy, Ports, Gateway, Repository | Infrastructure libs |
| Domain | Domain only | Any I/O, adapters, ports |
| Gateway | External libs | Domain, Application |
| Repository | DB drivers | Domain, Application |
| System | Everything | Nothing (but loud) |

⸻

12) Extension Points (What Apps Implement)

Application authors provide:
	•	Ingress adapters
	•	Interactions
	•	Policies
	•	Domain ValueObjects/Entities
	•	Gateways
	•	Repositories
	•	Ports

The kernel provides everything else.