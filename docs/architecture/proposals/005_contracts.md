# Proposal 005: Ṛta Contracts

**Status:** Proposed
**Context:** Enforces "Laws" for UnitOfWork, Outbox, and Nesting to ensure safety by default.

## Goals
1.  **Writes are impossible** without an explicit write scope.
2.  **Domain events are durable** (staged in-memory, committed to outbox).
3.  **Publishing is reliable** (retryable, never "half-committed").
4.  **Nested transactions are banned**; workflows are modeled as jobs.

## Canonical Terms
*   **CommandUseCase:** Write intent. May open a UnitOfWork.
*   **QueryUseCase:** Read intent. Must never open a UnitOfWork.
*   **CommandCtx:** Execution context authorized to write (contains `CommitCap`).
*   **InternalCtx:** Execution context NOT authorized to write.
*   **UnitOfWork (UoW):** Scoped mechanism for transactional writes and durable event staging.
*   **Domain Event:** Produced by domain code, staged in-memory; becomes durable via outbox at commit.
*   **Outbox:** Durable storage for events created during a transaction.

## Contracts and Laws

### Law 1: No writes without a UnitOfWork
*   Write operations must only be available through a `UnitOfWork` instance.
*   No write repository port is directly injectable into a UseCase.
*   **Implication:** If you see `uow`, it can write. If not, it can't.

### Law 2: No UnitOfWork without CommandCtx
*   `UnitOfWorkFactory.open(ctx)` must reject any ctx that is not `CommandCtx` or `SystemCtx`.
*   Enforced at runtime.
*   Attempting to open a UoW in a QueryUseCase must fail immediately.

### Law 3: Domain Events become durable only on commit
*   Domain code stages events in-memory.
*   `commit` must atomically persist:
    1.  Aggregate state changes
    2.  Outbox rows
*   This ensures atomicity.

### Law 4: Publishing is never inside the DB transaction
*   Outbound publish happens **after** commit, via `OutboxDispatcher`.
*   This avoids "half-committed" states and holding DB locks during network calls.

### Law 5: Nested UnitOfWork is forbidden
*   Opening a UoW when one is already active is an error.
*   Enforced mechanically (runtime throw).
*   Workflows must be modeled as Jobs or Sagas, not nested transactions.

### Law 6: QueryUseCases cannot generate domain events
*   Reads are side-effect free (except for Telemetry).

## Required Ports

### Primary Ports
1.  **CommandUseCasePort** (`execute(CommandCtx, input) -> output`)
2.  **QueryUseCasePort** (`execute(InternalCtx, input) -> output`)

### Secondary Ports (Core)
3.  **UnitOfWorkFactoryPort** (`open(CommandCtx) -> UnitOfWork`)
4.  **UnitOfWorkPort**
    *   `commit()`, `rollback()`
    *   Exposes Write Ports (e.g., `uow.orders.save()`).

### Secondary Ports (Outbox)
6.  **OutboxWritePort** (`stage(events)`)
7.  **OutboxReadPort** (`fetchBatch()`, `markPublished()`)
8.  **OutboxDispatcherPort**

## Reference Execution Flow

**B) CommandUseCase Execution**
1.  Open UoW: `uow = factory.open(ctx)` (Throws if no capacity or nested).
2.  Load context/aggregates.
3.  Run policies -> Evolve state.
4.  Persist: `uow.aggregate.save(agg)` -> Automatically drains pending events to Outbox.
5.  Commit: Atomic DB transaction (State + Outbox).
6.  Return Output.

**C) Outbox Dispatcher**
1.  Fetch unpublished events.
2.  Publish to external systems.
3.  Mark published.

## Testing Policy
*   **Unit:** Policies produce events. UoW guards trigger.
*   **Component:** In-Memory UoW verifies staging and commit.
*   **Integration:** Real DB verifies atomicity.
