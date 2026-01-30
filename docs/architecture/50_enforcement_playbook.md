50 — Enforcement Playbook (Ṛta Framework)

This document specifies the mechanisms that enforce the architecture.

Goal: Ensure that the framework's rules are not just suggestions, but mechanical constraints that are difficult to bypass.

⸻

1) Enforcement Channels

Ṛta uses four layers of enforcement:
1. **Inheritance:** Most code should extend the `Strict*` pattern suite.
2. **Type-Level:** TypeScript's type system locks down privileged operations (e.g., `PolicyToken` required for evolution).
3. **Runtime Guards:** Internal kernel checks throw `KernelError` when boundaries are crossed.
4. **Test-Time Scanning:** Automated tools scan the codebase for forbidden patterns.

⸻

2) The "Strict" Pattern Suite

The primary way to follow the architecture is by extending the classes in `src/patterns/strict/`.

StrictUseCase
- **Enforces:** Input/Output validation (Zod) and mandatory `OperationScope`.
- **Constraint:** Prevents execution without a valid trace and identity.

StrictEntity & StrictValueObject
- **Enforces:** Mutation only via `PolicyToken`.
- **Constraint:** Makes direct state changes impossible at the type level.

StrictRepository & StrictUnitOfWork
- **Enforces:** Transactional integrity and capability-gated writes.
- **Constraint:** Writes fail if the `OperationScope` lacks a `CommitCap`.

⸻

3) Deprecation of `Base*` Classes

The original `Base*` classes (e.g., `BaseEntity`, `BaseUseCase`) are now marked as **@deprecated**.
- **Reason:** They lack the mechanical enforcement of the `Strict` suite.
- **Enforcement:** A lint rule or `ForbiddenScan` pattern should eventually block the creation of new subclasses of `Base*` except in legacy or core framework code.

⸻

4) Test-Time Structural Enforcement

A) ForbiddenScan
Scans the `src/domain/` and `src/policy/` directories for:
- `Date.now()` or `new Date()` (must use `RitaClock`).
- `Math.random()` (must use `SimulatedRandom` for deterministic tests).
- Direct I/O (fs, http, db).
- Direct imports of adapters or repositories.

B) BoundaryCheck
Validates the **May-Call Matrix**:
- **Ingress** must not call **Repositories** (must use UseCases).
- **Policies** must not call **Adapters** or **Ports**.
- **Adapters** must not call back into **Domain** or **Application** orchestration.

C) Trace Shape Validation
Tests verify that the runtime execution graph (spans) matches the expected hierarchy:
`Adapter -> UseCase -> Policy -> Repository`.

⸻

5) Capability-Based Security

Authority is not based on roles, but on unforgeable tokens (Capabilities) stored in the `OperationScope.context.capabilities`.

- **CommitCap:** Required by `UnitOfWork.commit()`.
- **RawQueryCap:** Required for `AdminRepository` access.
- **PolicyToken:** Required by `evolve()`. Obtained only via `OperationScope.authorize()`.

⸻

6) Exception Policy (The Escape Hatch)

Exceptions to these rules must be:
1. **Explicit:** Documented in an allowlist for the scanners.
2. **Rare:** Only for legacy migration or complex system tasks.
3. **Visible:** Use `SystemCtx` and `AdminCap` to make privileged operations stand out in logs and traces.
