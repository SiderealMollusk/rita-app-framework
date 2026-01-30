# ADR 001: The OperationScope Primitive

**Status:** Accepted
**Context:** Intra-app scoping, Distributed Tracing, Security, Policy Enforcement.

## 1. The Problem
Previously, the framework suffered from "Argument Drilling" and "Trace Fragmentation".

1.  **Trace Fragmentation:** UseCases often created new contexts, breaking the distributed trace.
2.  **Insecure Authority:** `PolicyToken.createInternal()` was public, allowing bypass of governance.
3.  **Ungoverned Creation:** Entities were created via `new Class()`, bypassing `DecisionPolicy`.
4.  **Parameter Explosion:** Functions needed `ctx`, `uow`, `bus`, `clock` passed individually.

## 2. The Solution: `OperationScope`

We introduced a single container that represents the **Authorized Context of Execution**.

```typescript
export class OperationScope {
    public readonly context: BaseCtx;
    public readonly services: ServiceBag;

    // The Active Transaction
    readonly uow: UnitOfWork;

    // The ONLY way to obtain a PolicyToken
    authorize<T>(policy: DecisionPolicy, action: (token: PolicyToken) => T): T;

    // Trace Continuity
    fork(name: string): OperationScope;
}
```

## 3. Implementation Details

### 3.1 Trace Continuity (`fork`)
When a UseCase needs to do parallel work, it calls `scope.fork('SubTask')`. This preserves the `traceId` while generating a new `spanId`.

### 3.2 Security Hardening
`PolicyToken` now has a private constructor. The `OperationScope` uses a private `MINT_SYMBOL` to create tokens, ensuring that domain state changes only happen within an authorized `authorize()` block.

### 3.3 The "Governed Creation" Pattern
Subclasses of `StrictEntity` use a protected `createInstance` method that requires a `PolicyToken`.

```typescript
// In UseCase
scope.authorize(new KitchenPolicy(), (token) => {
    const ticket = KitchenTicket.create(data, token);
    repo.save(ticket);
});
```

## 4. Status
Implemented in `src/core/scope/OperationScope.ts`. All `Strict*` patterns leverage `OperationScope` for execution.
