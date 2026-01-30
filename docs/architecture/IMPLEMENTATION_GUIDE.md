# Implementation Guide: The "Strict" Evolution

*To the agent implementing these changes: You are about to turn Ṛta from a set of guidelines into a mechanical framework. This is a high-precision task.*

## 1. Core Principles to Uphold
- **No Choice = No Error:** Wherever possible, use types to make illegal states unrepresentable.
- **The Friction Tax is a Feature:** Do not look for shortcuts that bypass `OperationScope` or `CapabilityBag`.
- **Trace Everything:** If a function doesn't take a context or scope, it should probably be a pure utility.

## 2. Key Hints for Implementation

### 2.1 The Capability Bag
When implementing `CapabilityBag`, use a `Set<Constructor<Capability>>` or similar to store instances. Ensure that only the Core can mint these capabilities. Use `WeakSet` or Symbols if you need to prevent forgery.

### 2.2 OperationScope Refinement
Current `OperationScope` in `src/core/scope/` is a prototype.
- Ensure `authorize()` is the **only** public way to get a `PolicyToken`.
- Link `OperationScope` to the `UnitOfWork`. A UseCase should get its UoW *from* the scope, not create it independently.

### 2.3 Transitioning CommandUseCase
This is your biggest challenge.
- Currently, `CommandUseCase` manually promotes contexts.
- **New Goal:** The `StrictPrimaryAdapter` should create the `OperationScope`. The UseCase should receive it.
- Remove the "manual promotion" logic from the UseCase; it should trust the Scope it was given.

### 2.4 The "Strict" Naming
While the proposals use `StrictUseCase`, consider if you can just upgrade the `Base` classes or use a different namespace. If you keep the "Strict" prefix, ensure the inheritance hierarchy is clean.

## 3. Implementation Order (Recommended)
1.  **Phase 1: Security Kernel.** Refine `CapabilityBag`, `PolicyToken` (private constructor), and `OperationScope`.
2.  **Phase 2: The Edge.** Implement `StrictPrimaryAdapter` with Zod validation.
3.  **Phase 3: The Brain.** Implement `StrictUseCase` and `StrictPolicy`.
4.  **Phase 4: Persistence.** Implement `StrictRepository` (access only via UoW) and the Outbox listener.
5.  **Phase 5: Enforcement.** Write the ESLint rules or `ForbiddenScan` tests to block `Base*` usage.

## 4. Test Strategy
- Every "Strict" class must have a test showing it **REJECTS** invalid inputs (e.g., missing capabilities, unvalidated data).
- Use the `SimulatedClock` and `SimulatedIdGenerator` to keep all implementation tests deterministic.

## 5. Potential Pitfalls
- **Circular Dependencies:** Moving things into a centralized Scope can sometimes cause circular imports. Be careful with how `UnitOfWork` and `OperationScope` reference each other.
- **Async Context Loss:** Ensure spans are ended correctly even when errors are thrown. Use `try...finally`.

Good luck. You're building the future of AI-driven architecture.
