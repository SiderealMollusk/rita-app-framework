# Refactor Plan: Explicit Context Propagation

## Goal
Replace implicit/broken tracing with an Explicit Context Object (`RitaCtx`) passed to every system method.
This adheres to the "Explicitness Tax" philosophy.

## 1. The Primitive
#### [NEW] [src/system/RitaCtx.ts](file:///Users/virgil/Dev/rita-app-framework/src/system/RitaCtx.ts)
```typescript
export type RitaCtx = {
    readonly traceId: string;
    // Future: userId, tenantId, etc.
};
```

## 2. The Core Updates (Signatures)

### Tracer
- `startSpan(name, parentCtx?: RitaCtx)`

### BaseInteraction (The Root)
- `run(input)`: UNCHANGED (External Entry).
- `executeUseCase(useCase, input)` -> Creates `RitaCtx`, calls `useCase.execute(ctx, input)`.

### BaseComponent (Use Case)
- `execute(ctx: RitaCtx, input)`
- `_run(ctx: RitaCtx, input)`

### BaseGateway (Adapter)
- `safeExecute(ctx: RitaCtx, name, fn)`

### DecisionPolicy (Logic)
- `execute(ctx: RitaCtx, target, domainContext)`

## 3. The Ripple Effect (The Tax)
We must update all implementations in `dev-demo/`.
- `010_placeOrder`
- `011_vip_tagging`

## 4. Verification
Run the `dev-demo/011_vip_tagging/run.ts` and verify the `traceId` is now consistent across the entire flow.
