# ADR 005: Framework Contracts (UoW, Outbox, and Nesting)

**Status:** Accepted
**Context:** Enforcing "Laws" for transactions and events to ensure safety and consistency.

## 1. The Laws of Execution

### Law 1: No writes without a UnitOfWork
Durable state changes must only be possible through a `UnitOfWork`. This is enforced by requiring a `CommandCtx` (which contains a `CommitCap`) to start a transaction.

### Law 2: Domain Events become durable only on commit
Events produced by domain logic are staged in-memory within the `UnitOfWork`. They are atomically persisted to the Outbox only when the `UnitOfWork` is successfully committed.

### Law 3: Publishing happens after commit
Events are published to external systems only *after* the database transaction has successfully closed. This prevents side effects from firing if the transaction rolls back.

### Law 4: Nested Transactions are Forbidden
Opening a `UnitOfWork` when one is already active in the same scope is a terminal error. Complex workflows must be modeled as separate Jobs or Sagas.

### Law 5: Determinism in Domain Logic
Domain Policies and Entities must not access system time, randomness, or perform I/O. They must use injected ports (like `RitaClock`) provided via the `OperationScope`.

## 2. Implementation Status
These contracts are implemented across the core framework:
- `UnitOfWorkImpl` in `src/core/adapters/UnitOfWork.ts` manages event staging and atomic commits.
- `OperationScope` in `src/core/scope/OperationScope.ts` enforces authority and manages the `UnitOfWork` lifecycle.
- `StrictUseCase` and `StrictRepository` leverage these primitives to ensure compliance.

## 3. Reference Execution Flow (Command)
1. **Primary Adapter** identifies principal and creates a `CommandScope`.
2. **UseCase** receives the scope and starts work.
3. **Policies** are invoked to decide on state changes.
4. **Entities** are evolved using authorized `PolicyTokens`.
5. **Repositories** save changes through the `UnitOfWork`.
6. **UnitOfWork.commit()** persists all changes and stages outbox events.
7. **Post-Commit** handlers publish events to the external world.
