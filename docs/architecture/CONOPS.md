# Concept of Operations (CONOPS): Ṛta Framework

## 1. Introduction
This document describes the operational vision for the Ṛta Framework, focusing on how developers and AI agents interact with the system to build safe, observable, and deterministic applications.

## 2. The Operational Problem
Application development often suffers from:
- **Architectural Drift:** Over time, rules are ignored for speed.
- **Observability Gaps:** Tracing is broken by fragmented execution.
- **Security Bypasses:** Logic is executed without proper authority.
- **Non-Determinism:** Side effects are leaked into core logic.

## 3. The Vision: "Correct by Construction"
Ṛta operates on the principle that the framework should be a **mechanical gatekeeper**. If an operation is not authorized, traced, or safe, it should be physically impossible (via types) or legally impossible (via linting) to execute.

## 4. User Roles & Interactions

### 4.1 The Application Developer (Human or AI)
- **Defines Intent:** Writes Commands, Queries, and Policies.
- **Respects the Tax:** Accepts the "friction tax" of using `OperationScope` and `Strict*` base classes in exchange for guaranteed safety.
- **Uses the Core:** Relies on the stable `Core API` for all system interactions.

### 4.2 The Platform Engineer
- **Extends the Mesh:** Implements Secondary Adapters and Repositories.
- **Maintains the Guardrails:** Updates linting rules and structural tests.

## 5. Typical Operational Flow

1.  **Ingress:** A `StrictPrimaryAdapter` receives a raw request.
2.  **Sanitization:** The adapter validates the request against a Zod schema.
3.  **Scope Creation:** An `OperationScope` is minted, capturing the trace context and initial trust level.
4.  **Orchestration:** A `StrictUseCase` is invoked with the scope.
5.  **Decision:** The UseCase invokes a `StrictPolicy`, which returns `Evolutions`.
6.  **Mutation:** The UseCase applies evolutions via `BaseEntity.evolve`, which requires a `PolicyToken` only obtainable through the `OperationScope`.
7.  **Persistence:** The `UnitOfWork` (part of the scope) commits state changes and domain events to the Outbox atomically.
8.  **Egress:** The Outbox dispatcher publishes events to external systems after the transaction succeeds.

## 6. Failure Modes & Recovery
- **Validation Failures:** Caught at the Edge (Ingress) or UseCase boundary.
- **Unauthorized Access:** Caught by the `CapabilityBag` or `PolicyToken` check.
- **Regression:** Caught by `ForbiddenScan` and `BoundaryCheck` during CI.

## 7. Strategic Goals
- **100% Traceability:** No operation happens without a span.
- **Zero Drift:** Architectural rules are enforced by the build system.
- **Deterministic Core:** Logic is testable without mocks.
