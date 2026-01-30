# Job Ticket: L2_Router (The Fan-Out)

**Goal:** Demonstrate Event-Driven Projection and the Read/Write split.

## 1. Scenario
"A single Ticket with 3 items (Burger, Fries, Coke) is split into 3 streams: Grill (Burger), Fryer (Fries), Bar (Coke)."

## 2. Implementation Requirements
- **Projector:** `KitchenStationProjector` (extends `BaseProjector`).
- **Read Model:** `StationView` (In-memory filtered arrays).
- **Mechanism:**
    1. `PlaceOrder` publishes a `TicketCreated` event.
    2. `KitchenStationProjector` subscribes to `TicketCreated`.
    3. Projector updates separate `GrillRepository`, `FryerRepository`, and `BarRepository`.

## 3. Simulation Sheet
```json
{
  "name": "L2 Fan Out",
  "steps": [
    { "kind": "act", "actor": "Waiter", "intent": "PlaceOrder", "payload": { "items": ["Burger", "Fries", "Coke"] } },
    { "kind": "assert", "query": "StationView", "params": { "station": "Grill" }, "expect": ["Burger"] },
    { "kind": "assert", "query": "StationView", "params": { "station": "Bar" }, "expect": ["Coke"] }
  ]
}
```

## 4. Acceptance Criteria
- Assert that the `Ticket` remains a single aggregate in the primary repository.
- Assert that the `StationViews` are updated reactively via events.

## 5. Testing Strategy
- **Unit Tests:** 100% coverage for `StationItem` read model, `KitchenStationProjector`, `GetStationItems` query, and `PlaceOrderL2`.
- **Simulation:** End-to-end verification of the fan-out logic, ensuring items are correctly projected to the Grill, Fryer, and Bar stations based on their names.
