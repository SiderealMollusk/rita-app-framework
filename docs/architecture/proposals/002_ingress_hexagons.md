# Proposal 002: Ingress Hexagons & Strict Boundaries

**Status:** Proposed
**Context:** Standardizing "Gateways" (Primary Adapters), Logging, and Invalidation.
**Dependencies:** Proposal 001 (OperationScope).

## 1. The Concept: "Ingress Hexagons"

An **Ingress Hexagon** is a specialized module whose *sole responsibility* is to bridge the "Outside World" (HTTP, CLI, SQS) to the "Inside World" (OperationScope).

### 1.1 The Golden Rule
> "All they can do is clean, validate, parameterize, and pass along."

They MUST NOT contain domain logic.
They MUST NOT access Entities directly.
They MUST NOT bypass the scoped `UseCase`.

## 2. The Solution: `StrictPrimaryAdapter`

We introduce a new base class that enforces these rules via "Template Method" pattern and automated logging.

```typescript
export abstract class StrictPrimaryAdapter<TInput, TOutput> extends BasePrimaryAdapter {
    
    // 1. Mandatory Schema (The "Agreement")
    // Gateways can only talk to us if they satisfy this schema.
    protected abstract get inputSchema(): ZodSchema<TInput>;

    /**
     * The Standard Flow:
     * 1. Auto-Log [Ingress: Start]
     * 2. Validate Input (Clean)
     * 3. Parameterize (Create Scope)
     * 4. Execute Implementation
     * 5. Auto-Log [Ingress: End] or [Ingress: Error]
     */
    public async handle(rawInput: unknown): Promise<TOutput> {
         const correlationId = this.extractTrace(rawInput);
         Logger.info('[Ingress: Start]', { component: this.name, correlationId });

         try {
             // A. Validate & Clean
             const cleanInput = this.inputSchema.parse(rawInput);
             
             // B. Parameterize (Create Scope - see Proposal 001)
             const scope = ScopeFactory.createRequestScope(correlationId);
             
             // C. Pass Along
             const result = await this.onHandle(cleanInput, scope);
             
             Logger.info('[Ingress: End]', { component: this.name, correlationId });
             return result;
         } catch (err) {
             Logger.error('[Ingress: Error]', { component: this.name, err });
             throw err; // or map to HTTP 400/500
         }
    }

    // The only method subclasses are allowed to implement
    protected abstract onHandle(input: TInput, scope: OperationScope): Promise<TOutput>;
}
```

## 3. "Capacity Locking" & Gateways

The user mentioned: *"gateways... http serves etc only 'agree' to talk to those specifically"*

We achieve this via **Strict Typing**:
*   An HTTP Controller (The "Gateway") defines its handler as: `handle(req: Request)`.
*   Inside, it *must* delegate to a `StrictPrimaryAdapter`.
*   The Adapter's `inputSchema` acts as the "Contract". If the HTTP request body doesn't match, the Adapter rejects it before the domain is even touched.

## 4. Linting Rules

To enforce this:
1.  **Rule:** `rita/enforce-strict-ingress`
2.  **Logic:** Any class inheriting from `BasePrimaryAdapter` directly (instead of `Strict*`) triggers an ERROR.
3.  **Exception:** Must include `// @bypass-strict: <Reason>` comment.

## 5. Benefits
1.  **Observability:** 100% of ingress traffic is logged standardly.
2.  **Safety:** Bad data is rejected at the gate (Schema Validation).
3.  **Consistency:** Every entry point looks the same.
