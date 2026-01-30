# ADR 002: Ingress Hexagons & Strict Primary Adapters

**Status:** Accepted
**Context:** Standardizing Primary Adapters (Gateways) and OperationScope creation.
**Dependencies:** ADR 001 (OperationScope).

## 1. The Concept: "Ingress Hexagons"

An **Ingress Hexagon** is a specialized module whose responsibility is to bridge the "Outside World" (HTTP, CLI, SQS) to the "Inside World" (`OperationScope`).

### 1.1 The Golden Rule
> "All they can do is clean, validate, parameterize, and pass along."

## 2. The Solution: `StrictPrimaryAdapter`

We introduced `StrictPrimaryAdapter` to handle the lifecycle of an `OperationScope` for incoming requests.

```typescript
export abstract class StrictPrimaryAdapter extends BasePrimaryAdapter implements Strict {
    /**
     * Creates an OperationScope for a query (Read-only).
     */
    protected createQueryScope(principal: string, traceId?: string): OperationScope;

    /**
     * Creates an OperationScope for a command (Read-Write).
     */
    protected createCommandScope(principal: string, uow: UnitOfWork, traceId?: string): OperationScope;
}
```

## 3. Interaction with Use Cases

While the original proposal suggested validation at the adapter level, the implementation moved schema validation into `StrictUseCase`. The `StrictPrimaryAdapter` is responsible for:
1. Extracting/Generating Trace IDs.
2. Identifying the Principal.
3. Constructing the `OperationScope` (with appropriate `UnitOfWork` for commands).
4. Invoking the Use Case with the scope.

## 4. Status
Implemented in `src/patterns/strict/StrictPrimaryAdapter.ts`.
