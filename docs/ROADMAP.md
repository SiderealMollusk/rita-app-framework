# Master Roadmap: Rita App Framework

## 1. Audit Remediation (The "Junior Dev Punch List")
**Goal:** Address every specific point raised in `audits/jules/01_2026-01-29.md`.

- [ ] **Documentation Cleanup**: Fix `docs/TESTING.md` to remove lies about `src/run.ts`.
- [ ] **Test Refactoring**: Fix duplicate assertions in `BaseGateway.test.ts` and ensure `HexIntegrity.test.ts` actually tests instance types.
- [ ] **Rename Refactor**: Rename `RitaCtx` to `SystemCtx` (or `AppCtx`) globally to remove branding jargon.
- [ ] **Tooling Fixes**: Turn `BehaviorSpec.ts` from a comment bucket into real BDD middleware.

## 2. Finish Code TODOs
**Goal:** Locate and resolve every `TODO` or `FIXME` comment in the codebase.

- [ ] **BaseQuery Safety**: Implement the `AgentGuidanceError` throw when a Query accesses `ctx.commit`.
- [ ] **PolicyToken Privacy**: Move token creation to a truly private scope (Symbol/WeakMap or Module Closure) so it cannot be forged.
- [ ] **CQRS Split**: Formalize the separation between `Command` and `Query` logic in `BaseComponent` if currently shared/ambiguous.

## 3. Stabilization
**Goal:** Ensure the system is robust, reproducible, and ready for scaling.

- [ ] **CI Pipeline**: Formalize the `lint` and `test` scripts into a pre-commit or CI workflow.
- [ ] **Flake Detection**: Run tests in randomized order and multiple times to catch non-deterministic failures.
- [ ] **Strict Dep-Graph**: Ensure no circular dependencies exist between `system` internal modules.

## 4. Production-Grade DDD Implementation ("The Glossary")
**Goal:** Move beyond "Base Classes" and implement fully realized, production-standard DDD patterns.

- [ ] **Aggregate Roots**: Differentiate between simple `Entities` and `Aggregate Roots`. implement Transactional Consistency Boundaries.
- [ ] **Domain Events**: Implement a robust Event Bus for side effects (e.g., `DomainEvent`, `EventDispatcher`, `EventHandler`).
- [ ] **Repository Pattern**: Move from `BaseGateway` to true `Repository` interfaces with `Unit of Work` support for atomic commits.
- [ ] **Specification Pattern**: Implement composable Specifications for complex business rules (Policy logic).
- [ ] **Value Object Auditing**: Finalize the `_rev` and audit trail logic for all value objects.

## 5. Dev Demos & E2E Strategy
**Goal:** Prove the framework with real-world complexity.

- [ ] **Complex Demo**: Build a multi-entity domain (e.g., "Restaurant Kitchen" with Orders, Inventory, and Staff) to stress-test the interaction layer.
- [ ] **E2E Test Harness**: Create a harness that spins up the full Hexagon (without mocks) to test flows from Command -> Event -> Projection.
- [ ] **Snapshots**: Use Jest Snapshots for complex state evolutions to catch regression.

## 6. Schema Validation ("Lubricate & Hard Pass")
**Goal:** Runtime enforcement of contracts with helpful error messages.

- [ ] **Hard Pass**:
    - Implement Zod or TypeBox schemas for all `HexagonConfig` definitions.
    - Fail startup immediately (exit code 1) if the config does not match the schema.
- [ ] **Lubricate**:
    - Provide human-readable error messages explaining *exactly* what is wrong in the config (e.g., "Missing 'repository' key in UserHexagon").
    - Implement Input/Output validation middleware for all Interactions.

## 7. Ergonomics
**Goal:** Make the framework delightful and impossible to use incorrectly.

- [ ] **CLI Tooling**: Create a `rita` CLI to scaffold new Entities, Value Objects, and Interactions (reducing boilerplate fatigue).
- [ ] **Linter Plugins**: Write custom ESLint rules to enforce architectural boundaries (e.g., "Entities cannot import Use Cases").
- [ ] **Agent Error Guidance**: Ensure all framework errors provide specific instructions to the *Agent* (LLM) on how to fix the code it just wrote.
- [ ] **IDE Snippets**: VS Code snippets for common patterns (`class X extends BaseValueObject...`).
