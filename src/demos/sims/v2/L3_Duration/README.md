# Job Ticket: L3_Duration (The Wait)

**Goal:** Demonstrate deterministic time-travel using the `SimulatedClock`.

## 1. Scenario
"A Burger takes 10 mins to cook; a Steak takes 20 mins. The system must correctly report completion times."

## 2. Implementation Requirements
- **Use Case:** `StartCooking` schedules a `CompleteItem` command for the future using `clock.schedule()`.
- **Clock:** Must use `SimulatedClock`.

## 3. Simulation Sheet
```json
{
  "name": "L3 Duration",
  "steps": [
    { "kind": "act", "actor": "Chef", "intent": "StartCooking", "payload": { "item": "Steak" } },
    { "kind": "wait", "ms": 600000 }, // 10 mins
    { "kind": "assert", "query": "GetItemStatus", "expect": "COOKING" },
    { "kind": "wait", "ms": 600000 }, // Another 10 mins (Total 20)
    { "kind": "assert", "query": "GetItemStatus", "expect": "COMPLETED" }
  ]
}
```

## 4. Acceptance Criteria
- No use of `setTimeout` or `setInterval`.
- Assert that item completion happens *exactly* at the predicted virtual time.
