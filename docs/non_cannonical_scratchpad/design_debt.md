# Architecture Design Debt & Analysis

## 1. The "Hexagon" Config Disconnect
**Severity: High**
**Location:** `10_parts_list.md` vs Codebase (`Hexagon.ts`)

*   **The Issue:** The codebase heavily relies on `Hexagon.define(...)` and `HexagonConfig` (seen in user context and deleted docs), but the new **Canonical Constitution (10-50)** does *not mention it once*.
*   **The Gap:** Is the Hexagon config still the entry point? If so, where is it defined in the Kernel API (Doc 30)? If not, what replaced it?
*   **Risk:** The docs describe a theoretical framework (Contexts/Capabilities), but the code implements a Configuration framework (`Hexagon.ts`). These two need to marry.

## 2. "Provenance" Implementation is Hand-Wavy
**Severity: High**
**Location:** `30_kernel_api.md` (BaseValueObject)

*   **The Claim:** "BaseValueObject appends provenance history on every evolution."
*   **The Reality:**
    *   **Memory Leak Risk:** If I modify an object 10,000 times in a long-running process (e.g., a reducer), does the object size grow infinitely?
    *   **Persistence Ambiguity:** When I save an Entity to the DB, do I save the *entire* history? If yes, our DB size explodes. If no, we lose the "Audit Trail" the moment we save.
    *   **Rehydration:** When I load from DB, do I load the history? If not, `provenance` is ephemeral only (trace-scoped). The docs imply it's durable ("survive persistence" was in the deleted Glossary), but the new docs are silent on *how*.

## 3. Capability Enforcement in JS/TS is Leaky
**Severity: Medium**
**Location:** `20_contracts.md` / `30_kernel_api.md`

*   **The Claim:** "Capabilities aren't serializable" and "Cannot be constructed by app code."
*   **The Reality:** In TypeScript/Node, `private` constructors are a compile-time fiction. A determined developer can `(PolicyToken as any).constructor()`.
*   **The Fix:** We need to specify *runtime* privacy mechanisms (e.g., specific Symbols, WeakMaps, or closure-based factories) to make them truly unforgeable. Currently, it's "Security by TypeScript", which is not security.

## 4. Non-Standard Terminology
**Severity: Low (Cognitive Load)**

*   **"Evolution"**: Standard industry term is **Domain Event** or **State Transition**. "Evolution" sounds biological. It's a fine term, but it requires a mental mapping for every new hire.
*   **"Interaction"**: Standard term is **Use Case** or **Application Service**. "Interaction" implies bidirectional chatter (like a UI interaction), whereas these are often request/response pipelines.
*   **"TrustLevel"**: Standard term is **Security Context** or **Scope**.
*   **"Kernal"**: Typo (fixed), but "Kernel" usually implies "Shared Domain Kernel". Here it means "Framework Infrastructure". Distinguishing `src/kernel` (framework) from `src/core` (domain) is crucial.

## 5. Missing Specs (The "Dark Matter")

These are critical components referenced or implied but undefined:

*   **Error Handling Spec:** Doc 30 mentions `KernelError`, but what about:
    *   Validation Errors (400)
    *   Not Found (404)
    *   Business logic rejection (422)
    *   How do these map to the `ExternalCtx` response?
*   **The "Runner"**: Doc 40 describes flows, but who *calls* `Ingress.handle()`? Is there a server entrypoint (Express/Fastify wrapper)? The docs stop at the Ingress adapter, assuming "something" invokes it.
*   **Async/Event Bus**: Doc 40 mentions "Event Emission Flow", but Doc 30 (API) lists no `EventBus`, `Publisher`, or `Message` interfaces. It's entirely hypothetical.

## 6. Logic Gaps

*   **Query Interactions & Context**: Doc 40 says Query Interactions use `InternalCtx` but "No policies executed".
    *   *Question:* If there are no policies, where does the logic live?
    *   *Risk:* Logic leaks into the Interaction (Application Service), which violates the rule "Application Layer... Must not encode business rules" (from deleted Glossary, but implied in 20).
    *   *Fix:* We need "Read-Only Policies" or explicit permission for View Logic in Interactions.

## 7. The "ForbiddenScan" Tool
**Severity: Medium**
**Location:** `50_enforcement.md`

*   **Status:** Vaporware.
*   **The Problem:** The entire security model relies on "Test-time structural enforcement" (`ForbiddenScan`). If this tool isn't built immediately and made robust (e.g., using `ripgrep` or AST parsing), the "Law" is unenforceable.
*   **Recommendation:** This needs to be P0 implementation, not just P0 documentation.
