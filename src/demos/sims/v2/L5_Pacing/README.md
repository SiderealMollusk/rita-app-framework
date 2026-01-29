# Job Ticket: L5_Pacing (The Chain Reaction)

**Goal:** Implement a full Orchestrated Process Manager (Saga).

## 1. Scenario
"Finishing all 'Appetizers' automatically triggers the 'Entrees' to start cooking."

## 2. Implementation Requirements
- **Process Manager:** `KitchenWorkflowManager` (extends `BaseProcessManager`).
- **Logic:**
    - Listens for `ItemCompleted` event.
    - Checks if all items in `Course 1` (Apps) are done.
    - If yes, dispatches `StartCourse` for `Course 2`.

## 3. Simulation Sheet
```json
{
  "name": "L5 Pacing Saga",
  "steps": [
    { "kind": "act", "actor": "Chef", "intent": "FinishItem", "payload": { "name": "Wings" } },
    { "kind": "assert", "query": "CourseStatus", "params": { "course": 2 }, "expect": "WAITING" },
    { "kind": "act", "actor": "Chef", "intent": "FinishItem", "payload": { "name": "Calamari" } },
    { "kind": "assert", "query": "CourseStatus", "params": { "course": 2 }, "expect": "COOKING" }
  ]
}
```

## 4. Acceptance Criteria
- Use of `BaseProcessManager` is mandatory.
- The manager must have its own `traceId` context (or propagate the parent one appropriately).
- No hard-coding between the Chef's actions and the automatic start of the next course.
