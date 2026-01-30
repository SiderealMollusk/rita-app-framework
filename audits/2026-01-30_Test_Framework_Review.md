# RṚta Framework: Test Suite and Architectural Integrity Review
**Date:** 2026-01-30
**Auditor:** Jules (AI Senior Software Engineer)

## 1. Executive Summary

The Ṛta framework currently maintains a mechanical 100% test coverage across all non-exempt files. While this is an excellent baseline, the quality of coverage varies between core primitives and application-level demos. The "Strict" pattern suite provides strong architectural locks, but several "Ugly" bypasses exist that a "lazy" developer (or LLM) could exploit.

The framework's greatest strength is its deterministic simulation engine, but its greatest weakness is the lack of automated enforcement for the boundaries defined in its own documentation.

---

## 2. The Good, The Bad, and The Ugly

### The Good: Foundations of Trust
*   **Deterministic Simulation Engine:** The use of `LogVerifier` with JSONL "golden files" is a top-tier pattern. it ensures that complex flows (like L1-L5 simulations) remain deterministic and traceable down to the timestamp and trace ID.
*   **Strict Property Guards:** The use of `PolicyToken` and private `Symbols` to guard state evolution is a robust implementation of "Governed Execution".
*   **Capability-Based Security:** The `CapabilityBag` and `OperationScope` primitives correctly move authority from "who you are" to "what you can do", which is essential for LLM-governed environments.
*   **Mocking Utilities:** `RitaClock` and `RitaId` are well-integrated, allowing for 100% predictable tests without resorting to flaky `jest.useFakeTimers`.

### The Bad: Signs of Decay
*   **Shadowing by Deprecated Classes:** Many core simulations (L1-L5) still rely on `@deprecated` `BaseUseCase` and `BaseEntity` classes. This sends a mixed message to developers and provides a "lazy path" that bypasses Zod validation and Strict enforcement.
*   **Swallowy Simulation Errors:** `ScenarioRunner` catches and ignores all errors during `act` steps. While business errors are expected, infrastructure or framework errors (like a missing adapter) are also swallowed, making debugging harder.
*   **Context Promotion Bypass:** `CommandUseCase` and `QueryUseCase` (deprecated) create their own `ExternalCtx`. In a strict hexagonal architecture, the Primary Adapter should be the sole creator of the External Context.

### The Ugly: The "Lazy Developer" Bypasses
*   **The `as any` Escape Hatch:** Throughout the tests, `(PolicyToken as any)[MINT_SYMBOL]()` is used to forge tokens. While necessary for unit testing the domain in isolation, it demonstrates how easily the framework's core security can be bypassed in TypeScript.
*   **Stubbed Authorization:** `OperationScope.authorize` is currently a passthrough stub. It accepts a policy but doesn't verify the principal's authority to execute that policy, creating a false sense of security.
*   **Visible Internals:** Many "internal" methods (like `_evolve`) are public or protected but accessible via trivial bypasses, and there is no static analysis to prevent their use outside of the intended layers.

---

## 3. Framework Abusability Assessment

**Risk Level: Medium-High**

A "lazy" LLM dev is highly likely to:
1.  **Revert to Base Classes:** Use `BaseUseCase` instead of `StrictUseCase` to avoid defining Zod schemas.
2.  **Bypass Policies:** Import `PolicyToken` and use `@ts-ignore` or `as any` to call `_evolve` directly from a UseCase to "save time".
3.  **Leak Infrastructure:** Import `fs` or `axios` directly into a `DomainPolicy` because there is no runtime or build-time check to stop them.
4.  **Ignore UnitOfWork:** Use a repository directly without a UoW, leading to non-atomic state changes that still "pass" simple tests.

---

## 4. What Should Be: The Road to "Hardened" Architecture

### A. Static Analysis: The Missing Enforcement
As defined in `docs/architecture/20_contracts_and_boundaries.md`, we need automated enforcement.

#### 1. `ForbiddenScan` (The Purity Guard)
A tool that scans `src/**/domain/` and `src/**/policy/` for:
*   **Banned Tokens:** `Date.now`, `Math.random`, `setTimeout`, `process.env`.
*   **Banned Modules:** `fs`, `http`, `path`, `crypto` (except via framework ports).
*   **Implementation:** Can be done via a custom ESLint plugin or a `ts-morph` script run during `npm test`.

#### 2. `BoundaryCheck` (The Hexagon Guard)
Enforces the "May-Call Matrix":
*   **Rule:** Files in `domain/` cannot import from `usecases/`, `adapters/`, or `extras/`.
*   **Rule:** Files in `usecases/` cannot import from `adapters/` (must use `ports/`).
*   **Implementation:** `dependency-cruiser` is the recommended tool here. A `.dependency-cruiser.js` file should be added to the root.

### B. Larger Scale Enforcement
*   **Structural Linting:** Custom ESLint rules that require any class extending `StrictEntity` to be in a directory named `domain`.
*   **Coverage for Invariants:** Instead of just line coverage, implement **Mutation Testing** (e.g., using Stryker Mutator) to ensure that if a business rule is removed, a test actually fails.

---

## 5. Proposed Large-Scale Simulations

### 1. The "Audit Trail" Invariant Simulation
*   **Goal:** Prove that the framework's `Provenance` is unforgeable and matches the external logs.
*   **Setup:** A complex multi-step scenario (e.g., L5 Pacing).
*   **Assertion:** Post-simulation, a tool iterates through all entities in the repository, extracts their `_provenance.history`, and verifies that every entry has a matching `[Evolution]` log entry with the same `traceId` and `timestamp`.

### 2. The "Deterministic Chaos" Simulation
*   **Goal:** Prove that even with random failures, the system is deterministic.
*   **Setup:** Run a simulation with a `SimulatedRandom` seed that triggers "random" repository failures.
*   **Assertion:** Running the same simulation with the same seed must produce the exact same error logs and rollback state.

### 3. The "Concurrency Collision" Simulation
*   **Goal:** Prove that the `UnitOfWork` and `OperationScope` prevent race conditions (even in a single-threaded simulated environment with interleaved `waits`).
*   **Setup:** Two actors trying to modify the same entity with overlapping `wait` steps.

---

## 6. Advanced Testing Pitch: Moving Beyond Jest

1.  **Property-Based Testing (with `fast-check`):**
    *   Instead of testing `KitchenPolicy` with one item, test it with 1,000 random items and varied statuses.
    *   **Invariant:** "A ticket can never be COMPLETED if any item is RECEIVED."
2.  **TLA+ or Formal Models (Lightweight):**
    *   Define the `OperationScope` and `PolicyToken` lifecycle in a formal specification to prove that there is no sequence of calls that allows evolution without authorization.
3.  **Architecture-as-Code Tests:**
    *   Use `archunit-ts` to write tests like: `classes().that().resideInAPackage('..domain..').shouldNotDependOnAnyPackages('..adapters..')`.

---

## 7. Recommendations

1.  **Mandatory Migration:** Remove `BaseUseCase` and `BaseEntity` (or move them to a `legacy/` folder) to force use of `Strict` patterns.
2.  **Implement `BoundaryCheck` immediately:** Use `dependency-cruiser` to block illegal imports.
3.  **Harden `OperationScope`:** Replace the passthrough `authorize` with a real capability check.
4.  **Auditability Assertion:** Add a helper to `LogVerifier` that performs the Provenance-to-Log cross-check.
