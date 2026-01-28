# Phase 1: The Foundation - Implementation Plan

## Goal Description
Build the "Invisible Railings" of the Agent-First Framework. This includes the core system primitives that enforce logging, tracing, and immutable data provenance.

## Proposed Changes

### 1.1 Telemetry & Logging
#### [NEW] [Logger.ts](file:///Users/virgil/Dev/rita-app-framework/src/system/telemetry/Logger.ts)
- Implement a structured logger wrapper (around `console` for now, extensible later).
- Support `info`, `warn`, `error`, `debug`.
- Enforce structured metadata (correlation IDs).

#### [NEW] [Tracer.ts](file:///Users/virgil/Dev/rita-app-framework/src/system/telemetry/Tracer.ts)
- Implement a simple `Span` and `Tracer` simulation.
- Support `startSpan`, `end`, `recordException`.

### 1.2 The Logic Wrapper
#### [NEW] [BaseComponent.ts](file:///Users/virgil/Dev/rita-app-framework/src/system/BaseComponent.ts)
- Abstract class extending the "Template Method Pattern".
- `public execute(input)`: handles logging, tracing, and error catching.
- `protected abstract _run(input)`: the "hole" the Agent fills.

### 1.3 The Data Primitive
#### [NEW] [BaseValueObject.ts](file:///Users/virgil/Dev/rita-app-framework/src/system/BaseValueObject.ts)
- **Terminology Update**: Replacing `StrictDTO` with standard DDD terms.
- Immutable base class for objects *without* identity.
- Constructor captures stack trace ("Data Born").
- `with()` method enforces "Reasoned Mutation".

#### [NEW] [BaseEntity.ts](file:///Users/virgil/Dev/rita-app-framework/src/system/BaseEntity.ts)
- Extends functionality of Immutable Record for objects *with* Identity.
- Similar "Reasoned Mutation" and provenance tracking.

#### [NEW] [AgentGuidanceError.ts](file:///Users/virgil/Dev/rita-app-framework/src/system/AgentGuidanceError.ts)
- The "Instructional Exception" class (🛑 AGENT HALT).

## Verification Plan

### Automated Tests
- Create a test script `tests/phase1_verification.ts`.
- **Test 1 (Logging)**: Instantiate a dummy component, run it, verify logs appear with correlation ID.
- **Test 2 (Provenance)**: Create a `BaseValueObject`, print it to see if `_provenance` is captured.
- **Test 3 (Traps)**: Try to call `.with()` without a reason string and assert it throws `AgentGuidanceError`.
