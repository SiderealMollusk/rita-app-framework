# Ṛta Architecture Documentation
keep this true no matter what.
it can be changed, but it is **sacred** source of truth.

10_parts_list.md

What this is: The noun list.
Purpose: A dead-simple inventory of what exists in the system.
Top: The sacred table (30-second read).
Bottom: Verbose breakdown per part.

Question it answers:

“What are the pieces I can work with?”

This is the one agents and humans will open most.

⸻

20_contracts_and_boundaries.md

What this is: The law.
Purpose: May-call matrix, forbidden patterns, trust gating rules, capability requirements, repository constraints.
Question it answers:

“What is allowed and what is forbidden?”

This is where architecture becomes enforceable.

⸻

30_core_api.md

What this is: The promise.
Purpose: The stable surface of Ṛta's Core — what app code can rely on across versions.
Question it answers:

“What can I depend on not changing?”

This is what makes packaging and versioning possible later.

⸻

40_execution_flows.md

What this is: The movie.
Purpose: Canonical sequences for:
	•	External request
	•	Query
	•	Command/write
	•	Async job
	•	Admin/system task
	•	Failure path

Question it answers:

“What actually happens, step by step?”

This is the “mental debugger.”

⸻

50_enforcement_playbook.md

What this is: The teeth.
Purpose: How rules become real:
	•	forbidden API scans
	•	boundary import checks
	•	capability runtime guards
	•	test harness design
	•	allowlist process

Question it answers:

“How do we stop ourselves (and LLMs) from cheating?”

This is what turns Ṛta from a style guide into a framework.

⸻

60_peripheral_tooling.md (your instinct — and it’s a good one)

What this is: The orbit.
Purpose: A curated list of non-core but high-leverage tools that plug into Ṛta.

Think:
	•	tracing backends
	•	log stores
	•	dashboards
	•	job runners
	•	experiment tracking
	•	doc systems
	•	codegen helpers
	•	security scanners

Question it answers:

“What makes this framework pleasant to live in?”