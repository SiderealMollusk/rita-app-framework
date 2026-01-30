# Proposal 003: The Strict Architecture Suite

**Status:** Proposed
**Context:** Enforcing best practices via "Strict" base classes.
**Dependencies:** Proposal 001 (OperationScope).

## 1. The "Strict" Philosophy
The Framework provides `Base*` classes which are unopinionated.
The Framework *recommends* `Strict*` classes which enforce:

1.  **Mandatory Outbox:** Domain Events are only durable if they are committed via UoW.
    *   *Implementation:* `scope.uow.commit()` persists state + events in one transaction.
2.  **No Nested UoWs:** UseCase = 1 Unit of Work.
    *   *Enforcement:* `UoWFactory.open(ctx)` throws if a UoW is already active for that Scope.
3.  **Schema Contracts:** Zod everywhere.
4.  **Scope Enforcement:** No scope, no execution.


## 2. The Strict Template

### 2.1 StrictUseCase
Replaces `BaseUseCase`.

```typescript
export abstract class StrictUseCase<TInput, TOutput> {
    // 1. Contract
    protected abstract get requestSchema(): ZodSchema<TInput>;
    protected abstract get responseSchema(): ZodSchema<TOutput>;

    // 2. Standard Flow
    public async run(scope: OperationScope, rawInput: unknown): Promise<TOutput> {
        // Auto-Trace
        const span = Tracer.startSpan(this.name, scope.context);
        try {
            // Validate In
            const input = this.requestSchema.parse(rawInput);
            
            // Execute
            const output = await this.onExecute(scope, input);
            
            // Validate Out
            const cleanOutput = this.responseSchema.parse(output);
            
            return cleanOutput;
        } catch (e) {
            span.recordException(e);
            throw e;
        } finally {
            span.end();
        }
    }

    protected abstract onExecute(scope: OperationScope, input: TInput): Promise<TOutput>;
}
```

### 2.2 StrictEntity
Replaces `BaseEntity`.

```typescript
export abstract class StrictEntity<TData> extends BaseEntity<TData> {
    // 1. No public constructor
    // 2. No static .create() without token
    
    // The ONLY way to create is via Policy
    static create(token: PolicyToken, data: TData): StrictEntity<TData> {
        if (!PolicyToken.isAuthorized(token)) throw new UnauthorizedError();
        return new StrictEntity(data);
    }
}
```

### 2.3 StrictProjector
Replaces `BaseProjector`.
Enforces **Idempotency** and **Ordering**.

```typescript
export abstract class StrictProjector<TEvent> {
    public async handle(scope: OperationScope, event: TEvent) {
        // 1. Idempotency Check
        if (await this.hasProcessed(event.id)) {
            Logger.warn('Duplicate event ignored', { eventId: event.id });
            return;
        }
        
        // 2. Project
        await this.onProject(scope, event);
        
        // 3. Mark Processed
        await this.markProcessed(event.id);
    }
}
```


### 2.4 StrictRepository<TEntity>
Replaces `BaseRepository`.
Enforces **Scoped Access** and **Audit Logging**.

```typescript

### 2.4 StrictRepository<TEntity>
Replaces `BaseRepository`.
**Pattern:** Singleton Service + Method Injection (Explicit Scope).

```typescript

### 2.4 StrictRepository<TEntity>
Replaces `BaseRepository`.
**Pattern:** Exposed ONLY via UnitOfWork.

```typescript
export interface StrictRepository<T> {
    save(entity: T): Promise<void>;
    // Readers can be separate or included here if Safe
}

// Usage in UseCase:
// await scope.uow.orders.save(order);
```

**Enforcement:**
*   You cannot inject `StrictRepository` directly into a UseCase.
*   You must access it via `scope.uow`.
*   Therefore: No Scope -> No UoW -> No Save.

```

```

### 2.5 StrictSecondaryAdapter<TInput, TOutput>
Replaces `BaseSecondaryAdapter`.
Enforces **Outbound Schema** and **Circuit Breaking** (future).

```typescript
export abstract class StrictSecondaryAdapter<TInput, TOutput> {
    protected abstract get outboundSchema(): ZodSchema<TInput>;

    public async call(scope: OperationScope, input: TInput): Promise<TOutput> {
        // 1. Validate Outbound
        const cleanInput = this.outboundSchema.parse(input);
        
        // 2. Trace Injection (Propagate Trace ID to external system)
        const headers = {
            'x-trace-id': scope.context.traceId
        };
        
        // 3. Execute
        return this.onCall(cleanInput, headers);
    }
}
```


### 2.6 StrictPolicy
Replaces `DecisionPolicy`.
Enforces **Determinism** and **Audit Reasons**.

```typescript
export abstract class StrictPolicy {
    // 1. Must return a Decision (Allow/Deny)
    // 2. Must provide a reason string for every mutation
    abstract decide(actor: Principal, resource: StrictEntity<any>): Promise<Decision>;
}
```

### 2.7 StrictProcessManager
Replaces `BaseProcessManager`.
Enforces **Saga State** and **Timeouts**.

```typescript
export abstract class StrictProcessManager {
    // 1. Must handle "Completion" events
    // 2. Must have a "Compensation" logic (Rollback)
    abstract handle(event: DomainEvent): Promise<Command[]>;
}
```

## 3. The "Strict" Lint Rule


To enforce this architecture, we add a lint rule that flags extending `Base*` classes directly.

**Error:** `Class 'MyUseCase' extends 'BaseUseCase'. Use 'StrictUseCase' instead.`

## 4. Strict Connectivity & Rejection

### 4.1 Strict Rejection
"Strict" components MUST reject "Non-Strict" inputs.

*   **Rule:** A `StrictUseCase` signature MUST NOT accept generic `BaseEntity`. It must accept `StrictEntity<T>`.
*   **Runtime:** The `OperationScope` can verify that passed entities possess valid Provenance generated by a trusted PolicyToken.

```typescript
// BAD
handle(user: UserEntity) { ... }

// GOOD
handle(user: StrictEntity<User>) { ... }
```

### 4.2 Hexagon Connectivity Rules
We define subtypes of Hexagons to limit architectural coupling.

| Source Hexagon | Allowed Target | Reason |
| :--- | :--- | :--- |
| **Ingress** | **UseCase** | Clean & Pass only. No direct DB access. |
| **UseCase** | **Repository**, **Policy** | Orchestration logic. |
| **Repository** | *None* | Leaf node (IO). |
| **Policy** | *None* | Leaf node (Pure Logic). |

**Enforcement:**
Linting rules (`rita/strict-architecture`) will forbid importing "Repository" types into "Ingress" files.

