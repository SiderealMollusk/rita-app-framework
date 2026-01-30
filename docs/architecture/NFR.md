# Non-Functional Requirements (NFR): Ṛta Framework

## 1. Safety & Security
- **Isolation:** The Domain layer must have zero dependencies on infrastructure or I/O.
- **Authority:** No state mutation can occur without a `PolicyToken`.
- **Integrity:** All database writes must be performed through a `UnitOfWork` to ensure atomicity.

## 2. Observability
- **Trace Coverage:** 100% of external requests must be assigned a `traceId`.
- **Span Granularity:** Every UseCase and Policy execution must generate a unique span.
- **Logging:** All logs must be structured (JSONL) and include `traceId`, `trustLevel`, and `component`.

## 3. Reliability & Correctness
- **Determinism:** Given the same state and input, a Policy must always produce the same Evolutions.
- **Event Consistency:** Domain events must be persisted atomically with state changes (Outbox Pattern).
- **Idempotency:** Projectors must handle duplicate events without state corruption.

## 4. Performance
- **Friction Tax:** Architectural overhead (context propagation, validation) should not exceed 5-10% of total request latency.
- **Scalability:** The framework should support asynchronous event processing to offload heavy tasks from the request-response cycle.

## 5. Developer Experience (DX)
- **AI Guidance:** Architectural violations should result in `AgentGuidanceError` with clear fix instructions.
- **Type Safety:** 100% type coverage for core APIs.
- **Validation:** Inputs and outputs must be validated at boundaries using Zod.

## 6. Maintainability
- **Testability:** 100% unit test coverage for non-exempt files.
- **Modular Design:** New capabilities and adapters can be added without modifying the Core API.
