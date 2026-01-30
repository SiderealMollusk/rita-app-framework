# Concept of Operations (CONOPS): Ṛta Framework

## 1. Introduction
The Ṛta Framework is a **governed execution environment**. It ensures that every operation is safe, traceable, and attributable by providing a set of mechanical guardrails.

## 2. The Operational Problem
Application development often suffers from:
- **Architectural Drift:** Rules are ignored for speed.
- **Observability Gaps:** Tracing is broken by fragmented execution.
- **Security Bypasses:** Logic is executed without proper authority.
- **Non-Determinism:** Side effects are leaked into core logic.

## 3. The Vision: "Correct by Construction"
Ṛta operates on the principle that the framework should be a **mechanical gatekeeper**. If an operation is not authorized, traced, or safe, it should be physically impossible (via types) or legally impossible (via tests) to execute.

## 4. Typical Operational Flow

1.  **Ingress:** A `StrictPrimaryAdapter` receives a raw request and identifies the principal.
2.  **Scope Creation:** An `OperationScope` is minted, capturing the trace context and initial trust level.
3.  **Orchestration:** A `StrictUseCase` is invoked with the scope. It validates input against a Zod schema.
4.  **Decision:** The UseCase invokes a `StrictPolicy` via `scope.authorize()`, which returns `Evolutions`.
5.  **Mutation:** The UseCase applies evolutions to a `StrictEntity` using the authorized `PolicyToken`.
6.  **Persistence:** The entity is saved via a repository accessed through the `UnitOfWork` in the scope.
7.  **Commit:** The `UnitOfWork` commits state changes and domain events to the Outbox atomically.
8.  **Egress:** Post-commit handlers publish events to external systems.

## 5. Strategic Goals
- **100% Traceability:** Every operation happens within a managed span.
- **Zero Drift:** Architectural rules are enforced by `ForbiddenScan` and `BoundaryCheck`.
- **Deterministic Core:** Logic is testable without mocks by isolating I/O and time.

For more details, see the [Table of Contents](TableOfContents.md).
