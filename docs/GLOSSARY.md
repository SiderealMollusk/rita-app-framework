# Glossary - Ṛta Framework

This document defines the authoritative terminology used throughout the Ṛta Framework.

## Core Concepts

### Hexagon (Pattern)
The architectural pattern (Hexagonal Architecture) used by the framework. It separates the domain logic from external concerns via Ports and Adapters.

### Feature / Module
A concrete implementation of a "Hexagon". It represents a bounded context or a specific capability of the application.

### Kernel / Core
The framework's internal execution engine (located in `src/core`). It provides the base classes, security gates, and orchestration logic.

## Context & Security

### Trust Level
A classification of how much the system trusts the current execution.
- **External**: Untrusted input from outside the system.
- **Internal**: Trusted, read-only application context.
- **Command**: Trusted context with write authority.
- **System**: Administrative/system-only context with full authority.

### Capability
An unforgeable token that grants authority to perform a specific privileged action.
- **CommitCap**: Authorizes durable writes (state changes).
- **RawQueryCap**: Authorizes raw database queries.
- **PolicyToken**: Authorizes domain state evolution (held by Policies).

### Capability Bag
A container attached to a Context that stores and validates the available Capabilities.

### Promotion
The explicit process of elevating a Context to a higher Trust Level (e.g., from External to Internal).

## Execution

### Primary Adapter
An entry point into the system (e.g., HTTP Controller, CLI Handler). It receives "dirty" input and creates the initial Context.

### Secondary Adapter
A wrapper for an external dependency (e.g., Database, External API). It implements a Secondary Port.

### Primary Port
An interface defining what the system can do. It is implemented by Use Cases.

### Secondary Port
An interface defining what the system needs from the outside world (e.g., Persistence).

### Use Case
An orchestration unit that coordinates domain logic and side effects.
- **Command Use Case**: A use case that can mutate state.
- **Query Use Case**: A read-only use case.

### Unit of Work
An object that manages the lifecycle of a transaction or a set of atomic operations.

## Domain

### Value Object
An immutable domain object whose equality is based on its value, not identity. It maintains a provenance history of its "evolution".

### Entity
An object that has a unique identity (`id`) which persists through state changes. Like Value Objects in Ṛta, Entities are immutable and evolve through policies.

### Evolution
A data-only request to change the state of a Value Object or Entity. It must include a `reason`.

### Policy / Decision Policy
A pure, side-effect-free unit of logic that decides how domain state should evolve based on its current state and context.

### Provenance
The recorded history of all state changes (Evolutions) applied to a domain object, including timestamps and reasons.

## Observability

### Trace ID
A unique identifier used to link all execution steps within a single request flow.

### Span
A timed unit of work within a trace.
