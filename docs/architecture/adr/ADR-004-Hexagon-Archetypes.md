# ADR 004: Hexagon Archetypes & Roles

**Status:** Accepted
**Context:** Enforcing architectural patterns at the module level by defining clear roles for every component.
**Dependencies:** ADR 003 (Strict Suite).

## 1. The Concept
We move beyond generic components to **Archetypes** and **Roles**. Every module within a Hexagon must satisfy a specific role, which determines its allowed dependencies and behaviors.

## 2. The Defined Roles

### 2.1 Primary Adapter (Ingress)
- **Role:** Handles external requests (HTTP, CLI, Events).
- **Responsibility:** Sanitization, identifying the principal, and creating the `OperationScope`.
- **Constraint:** Must not contain business logic or access repositories directly.

### 2.2 Use Case (Application Core)
- **Role:** Orchestrates domain logic and side effects.
- **Responsibility:** Managing transactions via `UnitOfWork` and invoking policies.
- **Constraint:** Must not call infrastructure libraries directly.

### 2.3 Domain Policy (Business Brain)
- **Role:** Pure business logic.
- **Responsibility:** Making decisions based on state and returning evolutions.
- **Constraint:** Must be deterministic (no I/O, no time, no randomness).

### 2.4 Secondary Adapter & Repository (Egress)
- **Role:** External system and persistence interaction.
- **Responsibility:** Structured data access and protocol translation.
- **Constraint:** Must not call back into domain or application logic.

## 3. Implementation Status
Roles are defined in `src/core/hexagon/RoleModel.ts`. The `HexagonSpec` and `HexagonLoader` utilities leverage these roles to validate the structure of a hexagon at runtime or test-time.

## 4. Connectivity Rules (May-Call Matrix)

| From \ To | Primary Adapter | Use Case | Domain Policy | Repository | Secondary Adapter |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Primary Adapter** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Use Case** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Domain Policy** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Repository** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Secondary Adapter** | ❌ | ❌ | ❌ | ❌ | ❌ |

## 5. Benefits
- **Clear Responsibility:** Reduces ambiguity about where a piece of logic belongs.
- **Mechanical Enforcement:** Enables automated checks to prevent architectural drift.
- **AI-Friendly:** Provides a clear map for LLMs to follow when generating or modifying code.
