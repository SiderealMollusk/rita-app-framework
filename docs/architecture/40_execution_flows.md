40 — Execution Flows (Ṛta Framework)

This document defines the canonical runtime sequences of Ṛta.
If 30_kernel_api.md is the law, this is the choreography.

Every execution path in the system should resemble one of these flows.

⸻

1) The Core Pattern

All flows in Ṛta reduce to:

Ingress
→ Context Creation
→ Trust Promotion
→ Orchestration
→ Policy Evaluation
→ Evolution
→ Persistence or Emission
→ Exit

What changes is:
	•	Who is allowed to promote trust
	•	What capabilities exist
	•	Whether state is mutated
	•	Whether results are returned or emitted

⸻

2) External Command Flow (Write Path)

Use this for:
	•	HTTP POST / PUT
	•	CLI commands
	•	Webhooks
	•	User-driven actions

Sequence
	1.	Ingress (Primary Adapter)
An adapter receives untrusted input.

Examples:
	•	HTTP controller
	•	CLI handler
	•	Queue consumer

	2.	BaseUseCase.run

	•	Creates ExternalCtx
	•	Assigns traceId
	•	Starts root span

	3.	Context Promotion

	•	ExternalCtx → InternalCtx
This marks input as sanitized and structurally valid.

	4.	Application Orchestration (BaseComponent)

	•	Starts child span
	•	Fetches read models via repositories or secondary adapters
	•	Calls policies

	5.	Policy Evaluation

	•	Domain logic runs
	•	Evolutions are proposed
	•	PolicyToken authorizes mutation

	6.	Commit Gate

	•	InternalCtx → CommandCtx
	•	CommitCap is required

	7.	Persistence

	•	Repository.save(CommandCtx, entity)
	•	Events may be emitted

	8.	Exit

	•	Result returned to ingress
	•	Root span closes

⸻

Trace Shape

UseCase Span
→ Component Span
→ Policy Span
→ Repository Span

⸻

3) External Query Flow (Read Path)

Use this for:
	•	HTTP GET
	•	Dashboards
	•	Status checks
	•	Search endpoints

Sequence
	1.	Ingress (Primary Adapter)
Receives untrusted input.
	2.	BaseUseCase.run
Creates ExternalCtx.
	3.	Promotion
ExternalCtx → InternalCtx
	4.	Application Orchestration

	•	Calls repositories
	•	Calls read models
	•	No policies executed

	5.	Return

	•	No mutation
	•	No commit
	•	No events

⸻

Rule

Policies must not run on this path.
If they do, it is a bug.

⸻

4) Internal Command Flow (Job / Worker Path)

Use this for:
	•	Scheduled jobs
	•	Background tasks
	•	Queue consumers
	•	Workflow steps

Sequence
	1.	System Ingress (Primary Adapter)
Kernel or scheduler creates InternalCtx.
	2.	Optional Promotion
InternalCtx → CommandCtx
	3.	Application Orchestration

	•	Load state
	•	Apply policies
	•	Accumulate evolutions

	4.	Commit

	•	Repository.save
	•	Event emission

	5.	Exit

	•	Result logged
	•	No user-facing response

⸻

Trust Model

Jobs are trusted, but not omnipotent.
They still require CommitCap to mutate state.

⸻

5) System Flow (Administrative Path)

Use this for:
	•	Migrations
	•	Backfills
	•	Repair tools
	•	Data inspection
	•	Raw queries

Sequence
	1.	System Entry
Kernel creates SystemCtx.
	2.	Execution

	•	Can access raw adapters
	•	Can run administrative operations

	3.	Exit

	•	Full trace
	•	Full audit log

⸻

Rule

System flows must never be callable from external ingress.

⸻

6) Policy Execution Flow (Inner Loop)

This is the “engine room.”

Sequence
	1.	Component calls Policy.execute
	2.	Policy starts span
	3.	Domain logic runs
	4.	Evolutions proposed
	5.	For each evolution:
	•	Token authorizes
	•	BaseValueObject.evolve applies change
	•	Provenance recorded
	6.	Policy ends span

⸻

Guarantees
	•	No I/O
	•	No time access
	•	No randomness
	•	No persistence

Only logic and data.

⸻

7) Persistence Flow

Read

InternalCtx → Repository.get
	•	Allowed
	•	Traced
	•	Logged

Write

CommandCtx → Repository.save
	•	Requires CommitCap
	•	Traced
	•	Logged
	•	Emits domain events

Raw

SystemCtx → Repository.raw
	•	Requires RawQueryCap
	•	Fully audited

⸻

8) Event Emission Flow (CQRS / Eventing)

Optional but canonical.

Sequence
	1.	Repository.save succeeds
	2.	Domain event constructed from evolution history
	3.	Event published
	4.	Event handler runs as Internal Command Flow

⸻

Rule

Event handlers must not call external ingress.

They are inside the system.

⸻

9) Failure Flow

Domain Failure
	•	Policy throws validation error
	•	Component logs failure
	•	UseCase logs boundary error
	•	Trace closes

Infrastructure Failure
	•	Secondary Adapter throws
	•	Span records exception
	•	Component aborts
	•	UseCase logs failure

⸻

Rule

Errors are never swallowed.
They are always:
	•	Logged
	•	Traced
	•	Returned or escalated

⸻

10) Trust Boundary Flow

Promotions

External → Internal
Means:
	•	Input validated
	•	Types trusted
	•	Structure guaranteed

Internal → Command
Means:
	•	State mutation allowed
	•	Commit authorized

Internal → System
Means:
	•	Administrative authority granted

⸻

Demotion

Does not exist.
New context must be created instead.

⸻

11) Anti-Flows (Forbidden Patterns)

These flows must never exist:
	•	ExternalCtx → Repository.save
	•	Policy → Secondary Adapter
	•	Policy → Clock
	•	Secondary Adapter → Component
	•	Repository → Policy
	•	UseCase → Policy

If any of these appear, architecture has been violated.

⸻

12) Multi-Step Workflow Flow

For complex processes:

Each step is:
	•	A complete Internal Command Flow
	•	Emits an event
	•	Next step consumes event

No step calls another step directly.

⸻

13) Trace as Architecture

Every valid flow must produce a trace that visually matches this hierarchy:

Root UseCase
→ Application Component
→ Domain Policy
→ Secondary Adapter or Repository

If the trace graph does not look like this, the architecture is wrong.

⸻

14) Mental Model

Think of Ṛta as a river system:
	•	Ingress is rain
	•	Context is elevation
	•	Policies are channels
	•	Repositories are lakes
	•	Events are tributaries
	•	System tools are dams

Water never flows uphill.

⸻

15) Definition of Done

This document is complete when:
	•	Every execution path in the system maps to one of these flows
	•	No forbidden flow is possible without bypassing the kernel
	•	Traces visually confirm boundaries
	•	Capabilities align with promotions
	•	Event flows do not shortcut orchestration