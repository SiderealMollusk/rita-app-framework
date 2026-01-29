# Job Ticket: L1_Atomic (The Happy Path)

**Goal:** Implement the simplest possible end-to-end flow using the Rita Framework.

## 1. Scenario
"A waiter enters 1 Burger. The kitchen starts it, cooks it, and plates it."

## 2. Implementation Requirements
- **Domain:** `KitchenTicket` Entity. `Item` Value Object.
- **Use Cases:**
    - `PlaceOrder`: Creates a `KitchenTicket` with status `RECEIVED`.
    - `StartCooking`: Authorizes moving to `COOKING`.
    - `CompleteItem`: Moves to `COMPLETED`.
- **Policy:** `KitchenPolicy` that ensures items cannot be completed before being started.

## 3. Simulation Sheet (The Music)
```json
{
  "name": "L1 Happy Path",
  "steps": [
    { "kind": "act", "actor": "Waiter", "intent": "PlaceOrder", "payload": { "item": "Burger" } },
    { "kind": "assert", "query": "GetTicket", "expect": { "status": "RECEIVED" } },
    { "kind": "act", "actor": "Chef", "intent": "StartCooking", "payload": { "ticketId": "..." } },
    { "kind": "assert", "query": "GetTicket", "expect": { "status": "COOKING" } }
  ]
}
```

## 4. Acceptance Criteria
- 100% Trace consistency across all logs.
- `PolicyToken` must be used for all state changes.
- Successful execution in the `ScenarioRunner`.
