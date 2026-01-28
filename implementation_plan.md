# Phase 4: The Pilot Feature - Implementation Plan

## Goal Description
Implement a complete, vertical slice feature: **Place Order**.
This serves as the "Proof of Concept" (PoC) to verify that all framework primitives (`Val`, `Ops`, `DecisionPolicy`, `Hexagon`, `BaseInteraction`, `BaseGateway`) work together cohesively.

## Proposed Changes

### 4.1 The Contract
#### [NEW] [hex.ts](file:///Users/virgil/Dev/rita-app-framework/src/features/place-order/hex.ts)
- Use `Hexagon.define()` to declare the "Place Order" Pod.
- Explicitly list the Use Case, Policy, Interaction, and Gateway.

### 4.2 The Behavior (TDD)
#### [NEW] [PlaceOrder.spec.ts](file:///Users/virgil/Dev/rita-app-framework/src/features/place-order/PlaceOrder.spec.ts)
- Use `BehaviorSpec` to define the feature.
- **Scenario:** "Customer places a valid order".
- **Scenario:** "Order rejected due to rule violation (e.g., negative qty)".

### 4.3 The Domain
#### [NEW] [Order.ts](file:///Users/virgil/Dev/rita-app-framework/src/features/place-order/Order.ts)
- `Order` Entity (BaseEntity).
- `OrderStatus` and `OrderLineItem` VOs.

#### [NEW] [PlaceOrderPolicy.ts](file:///Users/virgil/Dev/rita-app-framework/src/features/place-order/PlaceOrderPolicy.ts)
- Extends `DecisionPolicy`.
- Logic: If total > 1000, set status to VIP.
- Logic: If qty <= 0, REJECT (via `falseFn` or throwing).

### 4.4 The Use Case (Imperative Shell)
#### [NEW] [PlaceOrder.ts](file:///Users/virgil/Dev/rita-app-framework/src/features/place-order/PlaceOrder.ts)
- Extends `BaseComponent`.
- Orchestrator:
    1. Load/Create Order.
    2. Apply `PlaceOrderPolicy`.
    3. Save via Gateway.

### 4.5 The Boundaries
#### [NEW] [PlaceOrderController.ts](file:///Users/virgil/Dev/rita-app-framework/src/features/place-order/PlaceOrderController.ts)
- Extends `BaseInteraction`.
- Accepts JSON, sanitizes, calls Use Case.

#### [NEW] [OrderRepository.ts](file:///Users/virgil/Dev/rita-app-framework/src/features/place-order/OrderRepository.ts)
- Extends `BaseGateway`.
- Simulates DB save with `safeExecute`.

## Verification Plan

### Automated Tests
- Run `PlaceOrder.spec.ts`.
- Verify the end-to-end flow using the behavior spec.
- Check logs to ensure `TraceId` propagates from Controller -> UseCase -> Policy -> Gateway.
