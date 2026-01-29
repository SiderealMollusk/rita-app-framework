30 — Core API (Ṛta Framework)

This document defines the non-negotiable core of Ṛta.
Everything else in the framework is an extension, adapter, or specialization of this core.

Goal:
If you freeze this API, you freeze the architecture itself.

⸻

1) Purpose of the Core

The Core exists to enforce:
	•	Execution governance
	•	Trust boundaries
	•	Capability-based authority
	•	Determinism boundaries
	•	Provenance and traceability

It is intentionally:
	•	Small
	•	Boring
	•	Stable
	•	Hard to change

Most framework evolution should happen outside this layer.

⸻

2) Core Responsibilities

The Core owns:
	•	Context construction and promotion
	•	Capability construction and validation
	•	Execution wrappers (spans, logs, errors)
	•	Domain mutation authorization
	•	Time and randomness sources
	•	Boundary enforcement hooks

The Core does NOT own:
	•	Business logic
	•	Domain models
	•	Infrastructure clients
	•	Persistence implementations
	•	UI or transport concerns

⸻

3) Core Modules (Minimum Set)

These modules form the irreducible core:

Context System
	•	ContextFactory
	•	ExternalCtx
	•	InternalCtx
	•	CommandCtx
	•	SystemCtx

Capability System
	•	Capability (base type)
	•	CapabilityBag
	•	CommitCap
	•	RawQueryCap
	•	AdminCap

Execution System
	•	Tracer
	•	Span
	•	Logger
	•	BaseUseCase
	•	BaseComponent

Domain Safety
	•	BaseValueObject
	•	BaseEntity
	•	DecisionPolicy
	•	PolicyToken

Determinism Controls
	•	RitaClock (implements ClockPort)
	•	RandomSource (optional but recommended)

Enforcement
	•	BoundaryAssert
	•	ForbiddenScan (test-time tool)
	•	KernelError types

⸻

4) Context API

Context Types

ExternalCtx
Represents untrusted input from the outside world.

Properties:
	•	traceId
	•	trustLevel = external
	•	capabilities = none

InternalCtx (and QueryCtx)
Represents trusted, deterministic execution.

Properties:
	•	traceId
	•	trustLevel = internal
	•	capabilities = read-only

CommandCtx
InternalCtx + write authority.

Properties:
	•	trustLevel = command
	•	capabilities include CommitCap

SystemCtx
Administrative execution.

Properties:
	•	trustLevel = system
	•	capabilities include AdminCap, RawQueryCap

⸻

ContextFactory

The only module allowed to create or promote contexts.

Functions:
	•	createExternal()
	•	promoteToInternal(externalCtx)
	•	promoteToCommand(internalCtx)
	•	promoteToSystem(internalCtx)

Rules:
	•	Promotion is monotonic (never downgrade).
	•	Promotion always emits a trace annotation.
	•	Promotion is explicit and visible in logs.

⸻

5) Capability API

Capability Base

A capability is:
	•	A real object instance (not a string, not a flag)
	•	Non-serializable
	•	Constructed only by the Core

CapabilityBag

Attached to Context.
Supports:
	•	has(capabilityType)
	•	require(capabilityType)

Standard Capabilities

CommitCap
Authorizes durable state changes.

RawQueryCap
Authorizes raw database queries.

AdminCap
Authorizes system-level operations.

⸻

6) Execution API

BaseUseCase

Role:
	•	Ingress boundary
	•	Context root
	•	Trust promotion point

Guarantees:
	•	Creates ExternalCtx (or appropriate start context)
	•	Wraps execution in root span
	•	Logs failure at boundary
	•	Only calls Application layer (BaseComponent)

⸻

BaseComponent

Role:
	•	Application orchestration unit

Guarantees:
	•	Always runs inside a span
	•	Always logs start/end/failure
	•	Receives propagated context
	•	Calls policies and adapters only

⸻

7) Domain Mutation API

DecisionPolicy

Role:
	•	Encapsulates business logic
	•	Proposes evolutions
	•	Holds PolicyToken privately

Rules:
	•	Cannot perform I/O
	•	Cannot access time directly
	•	Cannot mutate domain directly

⸻

PolicyToken

Role:
	•	Proof of authority for mutation
	•	Non-exportable constructor
	•	Held only by DecisionPolicy

⸻

BaseValueObject

Role:
	•	Immutable state
	•	Provenance recording
	•	Enforced evolution path

Rules:
	•	All state changes go through evolve
	•	evolve requires PolicyToken
	•	evolve requires reason
	•	Validation always runs on new state

⸻

8) Time and Randomness API

RitaClock

Role:
	•	The only time source allowed in domain and policy code. Implements `ClockPort`.

Functions:
	•	now()

Rules:
	•	Date.now and new Date are forbidden outside adapters/core
	•	Clock access must be explicit in core imports

⸻

RandomSource (Optional but recommended)

Role:
	•	Controlled randomness for simulations and probabilistic policies

Functions:
	•	next()
	•	nextInt(range)

Rules:
	•	Math.random forbidden in domain and policy layers

⸻

9) Persistence Safety API

BaseRepository (Core-owned interface)

Rules:
	•	Write methods require CommandCtx
	•	Read methods accept InternalCtx
	•	Raw methods require SystemCtx + RawQueryCap

Required Shape:
	•	getById(ctx, id)
	•	save(ctx, entity)
	•	findByIndex(ctx, field, value)

Explicitly Forbidden:
	•	query(ctx, string)
	•	exec(ctx, sql)

⸻

10) Gateway Safety API

BaseSecondaryAdapter

Role:
	•	External system adapter

Guarantees:
	•	Wraps all calls in spans
	•	Logs success/failure
	•	Never calls back into domain/application layers

⸻

11) Enforcement Hooks

BoundaryAssert

Runtime guard functions:
	•	assertNotExternal(ctx)
	•	requireCommit(ctx)
	•	requireSystem(ctx)

Called inside:
	•	Repositories
	•	Policies
	•	System tools

⸻

ForbiddenScan (Test-Time Structural Enforcement)

Scans for:
	•	Date.now in domain/policy
	•	Math.random in domain/policy
	•	DB drivers outside repositories
	•	Raw queries outside system persistence
	•	Direct imports across forbidden layers

Failure mode:
	•	Hard test failure
	•	No warnings
	•	No soft mode

⸻

12) Core Error Types

Standardized errors:
	•	UnauthorizedContextError
	•	MissingCapabilityError
	•	DeterminismViolationError
	•	BoundaryViolationError
	•	UnauthorizedEvolutionError

Purpose:
	•	Make architectural violations louder than business bugs

⸻

13) Stability Promise

Core code changes require:
	•	Migration notes
	•	Contract updates
	•	Test updates
	•	Explicit version bump

If this layer churns, the framework loses its spine.

⸻

14) Design Philosophy

The Core is not:
	•	Flexible
	•	Friendly
	•	Expressive

It is:
	•	Predictable
	•	Enforceable
	•	Boring
	•	Hard to bypass

Everything else can be creative.
This layer exists to make “doing the wrong thing” mechanically difficult.

⸻

15) Definition of Done

This document is complete when:
	•	Every core module exists as a file
	•	Every contract maps to a runtime guard, type lock, or test scan
	•	Promotion paths are explicit in code
	•	Capabilities cannot be forged or serialized
	•	Domain code cannot mutate without a policy
	•	Persistence cannot write without CommandCtx
    