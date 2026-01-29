Domain Glossary (V2)

Ubiquitous Language for a Governed Execution Framework

This document defines the shared language and operational model of the Framework.
All code, documentation, and agent-generated systems must adhere to these terms.

The Framework implements a Governed Execution Model:
State changes and external effects are treated as authorized decisions with recorded provenance, not as incidental side effects of code.

⸻

System Model

Governed Execution

An architectural model in which all meaningful computation is mediated by the framework. Application code does not directly mutate state or perform side effects. Instead, it proposes decisions and invokes authorized ports, which the framework validates, executes, and records.

Implementation guidance:
	•	All execution enters through a Primary Adapter.
	•	All side effects exit through a Secondary Adapter.
	•	All state transitions must be authorized by a Policy.

⸻

Decision Flow

The causal chain from external intent to observable outcome.

Sequence:
Input → System Context → Interaction → Policy → Evolution → State → Gateway → Effect → Trace and Provenance

Implementation guidance:
	•	Each stage must append to the Trace.
	•	Each Evolution must append to Provenance.
	•	No stage may be skipped or bypassed.

⸻

Authority

The explicit right to perform a privileged operation, such as mutating domain state or invoking external systems.

Implementation guidance:
	•	Authority is carried in the System Context.
	•	Authority is proven by Capabilities, not by code location or convention.
	•	Privileged methods must require a Capability token.

⸻

Determinism Boundary

The boundary between pure, repeatable logic and non-deterministic effects.

Implementation guidance:
	•	Policies and Domain Model must be deterministic.
	•	Gateways are explicitly non-deterministic.
	•	The boundary must be visible in code structure, not just documentation.

⸻

Ports and Adapters

Primary Port

A formal contract that defines a business capability exposed by the system. It specifies:
	•	Input shape
	•	Required authority
	•	Expected outcomes
	•	Provenance guarantees

Industry term: Inbound Port

Implementation guidance:
	•	Represented as an interface or abstract contract.
	•	Must not depend on infrastructure or transport.
	•	Must declare what Capabilities it requires in the System Context.

⸻

Primary Adapter

A concrete mechanism that implements a Primary Port.

Examples:
	•	HTTP controller
	•	CLI command
	•	Event handler

Industry term: Inbound Adapter

Implementation guidance:
	•	Responsible for parsing and sanitizing input.
	•	Creates the System Context.
	•	Grants initial authority scope.
	•	Must not contain business logic.

⸻

Secondary Port

A formal contract that defines a capability the system requires from external infrastructure.

Examples:
	•	Persistence
	•	Messaging
	•	External APIs
	•	Clocks
	•	Identity providers

Industry term: Outbound Port

Implementation guidance:
	•	Defined as an interface owned by the Domain or Application layer.
	•	Must express intent, not technology.
	•	Must declare required authority to invoke.

⸻

Secondary Adapter

A concrete implementation of a Secondary Port.

Examples:
	•	SQL repository
	•	REST client
	•	Queue publisher
	•	File system adapter

Industry term: Outbound Adapter, Gateway

Implementation guidance:
	•	Must wrap all operations in tracing and logging.
	•	Must validate authority before execution.
	•	Must never be called directly by Policies.

⸻

Application Layer

Interaction

An Application Service that represents a single business intent.

Examples:
	•	Tag an Order
	•	Run a Job
	•	Commit a Transaction
	•	Generate an Artifact

Industry terms:
	•	Use Case
	•	Application Service

Implementation guidance:
	•	Orchestrates reads, policies, and writes.
	•	May perform side effects via Secondary Ports.
	•	Must not encode business rules.
	•	Must pass System Context unchanged to all calls.

⸻

System Context

A request-scoped execution context propagated through all layers.

Contains:
	•	Trace identity
	•	Authority scope
	•	Optional request metadata

Industry terms:
	•	Request Context
	•	Execution Context

Implementation guidance:
	•	Must be required by all Interactions, Policies, and Gateways.
	•	Must not be globally accessible.
	•	Must be explicitly threaded through calls.

⸻

Domain Layer

Entity

A domain object defined by identity and lifecycle. Represents a concept whose continuity matters over time.

Industry term: Entity, Aggregate Root

Implementation guidance:
	•	Owns invariants.
	•	Must only change via Evolutions.
	•	Should be the root of consistency boundaries.

⸻

Value Object

A domain object defined entirely by its attributes. It is immutable and has no identity beyond its value.

Industry term: Value Object

Implementation guidance:
	•	Must be deeply immutable.
	•	Must be validated at construction.
	•	Must be safe to freely copy.

⸻

Aggregate

A consistency boundary that groups Entities and Value Objects and enforces domain invariants.

Industry term: Aggregate

Implementation guidance:
	•	Only the Aggregate Root may be persisted.
	•	Policies should target Aggregates, not internal members.

⸻

Policy

A pure, deterministic Domain Service that evaluates business rules and proposes authorized state transitions.

Industry terms:
	•	Domain Service
	•	Rule Engine

Implementation guidance:
	•	Must not perform I/O.
	•	Must not call Gateways.
	•	Must return Evolutions, not mutate state.
	•	Must hold the Capability required to authorize mutation.

⸻

Evolution

A proposed, authorized state transition.

Contains:
	•	The changes
	•	The reason
	•	The authorizing policy

Industry terms:
	•	Domain Event
	•	State Transition

Implementation guidance:
	•	Must be data-only.
	•	Must be applied by the framework, not by the Policy.
	•	Must append to Provenance when executed.

⸻

Authority and Security Model

Capability

A proof of authority required to perform a privileged operation.

Industry term: Capability-Based Security

Implementation guidance:
	•	Represented as an unforgeable token.
	•	Must not be constructible by application code.
	•	Must be required by privileged methods.

⸻

Authority Scope

The subset of operations a System Context is permitted to perform.

Implementation guidance:
	•	Assigned at the Primary Adapter.
	•	Reduced, never expanded, inside the system.
	•	Validated at every Secondary Port.

⸻

Trust Boundary

A boundary across which assumptions about input, identity, or authority no longer hold.

Industry term: Trust Boundary, Zero Trust Boundary

Implementation guidance:
	•	All Primary Ports cross a Trust Boundary.
	•	All Secondary Ports cross a Trust Boundary.
	•	Validation and authority checks must occur at both.

⸻

Observability and Lineage

Trace

A causal chain of execution across system components.

Industry term: Distributed Trace

Implementation guidance:
	•	Must originate at a Primary Adapter.
	•	Must propagate through all layers.
	•	Must include Policy and Gateway spans.

⸻

Span

A timed segment of work within a Trace.

Implementation guidance:
	•	Must wrap all Gateway calls.
	•	Must wrap all Policy execution.
	•	Must record errors and exceptions.

⸻

Provenance

The recorded lineage of a piece of state.

Contains:
	•	What changed
	•	Why it changed
	•	When it changed
	•	Which policy authorized it

Industry terms:
	•	Audit Trail
	•	Data Lineage
	•	W3C PROV

Implementation guidance:
	•	Must be immutable.
	•	Must be attached to domain state.
	•	Must survive persistence and rehydration.

⸻

Provenance Graph

The graph formed by linking Evolutions, Artifacts, and Jobs over time.

Industry terms:
	•	Provenance Graph
	•	Knowledge Graph
	•	Lineage Graph

Implementation guidance:
	•	Must be queryable.
	•	Must support reconstruction of causal chains.
	•	Should support visualization.

⸻

CQRS and Event Model

Command Model

The part of the system responsible for decisions and state transitions.

Industry term: CQRS Command Side

Implementation guidance:
	•	Interactions invoke Policies.
	•	Policies emit Evolutions.
	•	Evolutions mutate Aggregates.

⸻

Query Model

The part of the system responsible for retrieving and projecting state.

Industry term: CQRS Query Side

Implementation guidance:
	•	Must not mutate state.
	•	May use Projections or Read Models.
	•	May bypass Policies.

⸻

Event Stream

The ordered history of Evolutions that produced the current state.

Industry term: Event Store

Implementation guidance:
	•	Must be append-only.
	•	Must be replayable.
	•	May be compacted via Snapshots.

⸻

Snapshot

A materialized representation of current state derived from an Event Stream.

Implementation guidance:
	•	Must be reproducible from events.
	•	Must include a pointer to the last applied Evolution.

⸻

Workflow and Computation

Job

A reproducible, parameterized execution of computation that consumes and produces Artifacts.

Industry terms:
	•	Task
	•	Pipeline Step
	•	Build Action

Implementation guidance:
	•	Must declare inputs and outputs.
	•	Must be fingerprinted.
	•	Must be repeatable.

⸻

Artifact

A persisted, addressable output of a Job that represents a meaningful intermediate or final result.

Industry terms:
	•	Data Artifact
	•	Dataset
	•	Derived Product

Implementation guidance:
	•	Must be content-addressable.
	•	Must link to the Job that produced it.
	•	Must link to inputs it was derived from.

⸻

Fingerprint

A deterministic hash of inputs, code, and parameters used to identify reusable computation.

Industry terms:
	•	Content Hash
	•	Build Cache Key

Implementation guidance:
	•	Must change if any input, prompt, or logic changes.
	•	Used to enable caching and reproducibility.

⸻

Architectural Guarantees (Contracts)

Mutation Contract

State may only change via Evolutions authorized by Policies.

Implementation guidance:
	•	Domain objects must reject direct mutation.
	•	Framework must enforce this at runtime.

⸻

Side Effect Contract

All interaction with external systems must pass through Secondary Ports.

Implementation guidance:
	•	Gateways must be the only place where I/O occurs.
	•	Policies must not reference infrastructure.

⸻

Trace Contract

All meaningful execution must be traceable.

Implementation guidance:
	•	Missing Trace context is a runtime error.
	•	Spans must wrap all Policies and Gateways.

⸻

System Identity

One-Sentence Definition

Rita is a governed, hexagonal execution system in which business capabilities are exposed through authorized ports, decisions are encoded as policies, state changes are recorded as evolutions, and system behavior is observed through traceable projections.

⸻

Practical Guidance for Agents and Developers
	•	Never mutate domain state directly. Always propose Evolutions.
	•	Never perform I/O outside a Gateway.
	•	Never create Capabilities in application code.
	•	Never bypass System Context propagation.
	•	Prefer Projections for reads, not live domain traversal.
	•	Treat Provenance as a first-class feature, not a debug tool.