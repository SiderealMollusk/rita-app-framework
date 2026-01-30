# Proposal 001: The OperationScope Primitive

**Status:** Proposed
**Context:** Intra-app scoping, Distributed Tracing, Security, Policy Enforcement.

## 1. The Problem
Currently, our framework suffers from "Argument Drilling" and "Trace Fragmentation".

1.  **Trace Fragmentation:** `CommandUseCase` (and others) often create a *new* `ExternalCtx`, breaking the distributed trace from the API layer.
2.  **Insecure Authority:** `PolicyToken.createInternal()` is public static, allowing any code to bypass governance.
3.  **Ungoverned Creation:** Entities are created via `new Class()`, bypassing `DecisionPolicy` and leaving "Creation" events unlogged.
4.  **Parameter Explosion:** Functions need `ctx`, `uow`, `bus`, `clock` passed individually.

## 2. The Solution: `OperationScope`

We introduce a single, immutable-ish container that represents the **Authorized Context of Execution**.

```typescript
/**
 * The Unit of Execution.
 * passed down from Adapter -> UseCase -> Policy -> Entity
 */
/**
 * The Unit of Execution.
 * Passed down from Adapter -> UseCase.
 * 
 * DESIGN NOTE: 
 * We separate 'Identity' (context) from 'Mechanism' (uow).
 * Helpers that only need to READ should take `scope.context`.
 * Helpers that need to WRITE must take `scope` (Explicit UoW).
 */
export interface OperationScope {
    // 1. Identity & Telemetry (Immutable, No Write Access)
    readonly context: InternalCtx;
    
    // 2. The Active Transaction (Mutable)
    readonly uow: UnitOfWork;
    
    // 3. Authority
    authorize<T>(policy: DecisionPolicy, action: (token: PolicyToken) => T): T;
    
    // 4. Continuity
    fork(name: string): OperationScope;
}

```

## 3. Detailed Design

### 3.1 Trace Continuity (`fork`)
When a UseCase needs to do parallel work or start a sub-task (Saga), it calls `scope.fork('SubTask')`.
*   **Retains:** `traceId` (The parent trace).
*   **Generates:** New `spanId`.
*   **Result:** The "Trace Tree" is preserved automatically.

### 3.2 Security Hardening
*   **Current:** `PolicyToken.createInternal()` is public.
*   **New:** `PolicyToken` constructor is `private`. It exports a unique `Symbol` or `SecretKey`.
*   `OperationScope` is the *only* class that holds this key.
*   **Effect:** You cannot write to an Entity without passing through `scope.authorize(policy, ...)`.

### 3.3 The "Governed Creation" Pattern
Instead of `KitchenTicket.create(data)`, we move to:

```typescript
// In UseCase
scope.authorize(new KitchenPolicy(), (token) => {
    // .create() now requires a token!
    const ticket = KitchenTicket.create(data, token); 
    repo.save(ticket);
});
```

## 4. Migration Path

1.  **Phase 1:** Introduce `OperationScope` class and `ServiceBag`.
2.  **Phase 2:** Update `BaseUseCase.run(ctx)` -> `BaseUseCase.run(scope)`.
3.  **Phase 3:** Privatize `PolicyToken` and update `BaseEntity` to require tokens for creation.

## 5. Benefits
*   **Security:** Impossible to bypass Policy.
*   **Observability:** Impossible to break a Trace.
*   **Ergonomics:** One argument (`scope`) to rule them all.
