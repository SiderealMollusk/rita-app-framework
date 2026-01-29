Missing
	•	Composition Root / Runner
No defined system entrypoint (HTTP server, CLI, worker, scheduler) that invokes Ingress/Interactions.
	•	Event Bus / Messaging API
Async flow is described but no EventBus, Publisher, Subscriber, or delivery guarantees exist in the Kernel API.
	•	Error Taxonomy & Mapping
No standard classes or rules for:
	•	Validation vs Domain vs Infrastructure errors
	•	Mapping to External responses (HTTP/CLI exit codes, retries, etc.)
	•	Persistence Strategy Spec
State-store vs Event-store vs Hybrid is not formally defined.
	•	Enforcement Tool Spec
“ForbiddenScan” is referenced but has no concrete design, interface, or implementation plan.
	•	Read Model Architecture
No defined pattern for Query-side logic (where projections, view logic, or derived data lives).

⸻

Undefined / Ambiguous
	•	Hexagon Role
Hexagon.define() exists in code but is not placed anywhere in the architecture model or Kernel API.
	•	Provenance Lifecycle
Unclear if history is:
	•	In-memory only
	•	Persisted
	•	Bounded/unbounded
	•	Rehydrated on load
	•	Capability Security Model
Runtime enforceability of tokens is unspecified (threat model, forgery resistance, trust boundaries).
	•	Trust Context Promotion Rules
Who can elevate External → Internal → System, and under what conditions, is not formalized.
	•	Query Logic Placement
If Policies are forbidden on reads, where business logic for views is allowed to live is unclear.
	•	Async Semantics
At-least-once vs at-most-once vs exactly-once delivery is not defined.

⸻

Language / Standards Drift
	•	Interaction → Use Case / Application Service
Current term is nonstandard and implies UI behavior.
	•	Evolution → Domain Event / State Transition
“Evolution” is poetic but nonstandard in DDD/CQRS.
	•	TrustLevel → Security Context / Scope
Industry typically uses “security context” or “authorization scope.”
	•	Kernel → Framework / Infrastructure Layer
“Kernel” usually implies Shared Domain Kernel in DDD, not framework internals.
	•	Hexagon (overloaded)
Needs clear distinction between:
	•	Architectural Hexagon (Ports & Adapters)
	•	Config/Runtime construct (Hexagon.define())

---

