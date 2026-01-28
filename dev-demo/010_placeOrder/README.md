# 010_placeOrder - Vertical Slice Demo

This directory contains a complete "Vertical Slice" of a feature using the Rita App Framework.
It demonstrates the Hexagonal Architecture, strictly separated boundaries, and pure logic policies.

## Structure

*   **`hex.ts`**: The "Manifest" defining the feature's structure.
*   **`Order.ts`**: The Domain Entity (Immutable, Self-Validating).
*   **`PlaceOrderPolicy.ts`**: The Logic Engine (Pure Decision Making).
*   **`PlaceOrder.ts`**: The Use Case (Orchestration).
*   **`PlaceOrderController.ts`**: The Inbound Boundary (Input Handling).
*   **`OrderRepository.ts`**: The Outbound Boundary (Data Access).
*   **`PlaceOrder.spec.ts`**: The Feature Tests (TDD).

## Running the Demo

Run the tests for this specific feature:
```bash
npm test dev-demo/010_placeOrder/PlaceOrder.spec.ts
```
