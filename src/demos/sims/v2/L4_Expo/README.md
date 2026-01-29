# Job Ticket: L4_Expo (The Merge)

**Goal:** Demonstrate complex state aggregation (Parent/Child status).

## 1. Scenario
"The Ticket cannot be closed until ALL items (fast and slow) arrive at the Expo window."

## 2. Implementation Requirements
- **Policy:** `TicketClosingPolicy` (extends `DecisionPolicy`).
- **Logic:** `canClose = all(items.status == 'READY')`.
- **Interaction:** `CloseTicket` command.

## 3. Simulation Sheet
```json
{
  "name": "L4 Expo Merge",
  "steps": [
    { "kind": "act", "actor": "Chef", "intent": "FinishItem", "payload": { "item": "Burger" } },
    { "kind": "act", "actor": "Expo", "intent": "CloseTicket", "payload": { "id": "tk-1" } },
    { "kind": "assert", "query": "GetTicketStatus", "expect": "OPEN" }, // Rejected because Steak is missing
    { "kind": "act", "actor": "Chef", "intent": "FinishItem", "payload": { "item": "Steak" } },
    { "kind": "act", "actor": "Expo", "intent": "CloseTicket", "payload": { "id": "tk-1" } },
    { "kind": "assert", "query": "GetTicketStatus", "expect": "CLOSED" }
  ]
}
```

## 4. Acceptance Criteria
- Policy must block the `CloseTicket` command if items are pending.
- Logs must clearly show the `BusinessRuleViolationError` on the first attempt.
