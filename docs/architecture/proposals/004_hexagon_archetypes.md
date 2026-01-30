# Proposal 004: Hexagon Topologies & Capability Security

**Status:** Proposed
**Context:** Enforcing architecture via **Runtime Capabilities**, not just linting.
**Dependencies:** Proposal 001 (OperationScope), Proposal 003 (Strict Suite).

## 1. The Core Shift: Scope-Based Authority
Linting is weak. We want **Capability-Based Security**.
Instead of just saying "Don't import X", we strictly control **what the Scope allows**.

We define three distinct Scopes (Capabilities):

### 1.1 IngressScope (The "Bouncer")
*   **Held By:** Ingress Hexagons (HTTP/CLI Adapters).
*   **Capabilities:**
    *   `validate(schema, data)`
    *   `dispatch(command)` -> **Hand-off to Domain.**
*   **MISSING Capabilities:**
    *   `authorize()` -> **Cannot mint PolicyTokens.** (Physical inability to write to DB).
    *   `repo()` -> **Cannot access repositories.**

### 1.2 DomainScope (The "Brain")
*   **Held By:** or Created By the `Dispatcher` when a Command matches a UseCase.
*   **Capabilities:**
    *   `authorize(policy)` -> **Can mint Tokens.**
    *   `repo(Repository)` -> Can load/save data.
*   **Constraint:** Only exists *inside* a `StrictUseCase`.

### 1.3 EgressScope (The "Pipe")
*   **Held By:** Secondary Adapters.
*   **Capabilities:**
    *   `telemetry()` -> Can log and trace.
    *   `headers()` -> Can inject trace headers.
*   **MISSING:**
    *   `authorize()` -> Cannot write back to the domain.

## 2. Strong Connectivity via Types
We replace "directory rules" with **Type Constraints**.

```typescript
// INGRESS (Edge)
class MyController extends StrictPrimaryAdapter {
   // Compiler Error: 'IngressScope' does not exist on type 'DomainScope'
   // run(scope: IngressScope) {
   //    scope.authorize(...) // ERROR: Method not found!
   // }

   run(scope: IngressScope) {
       // The ONLY way forward is to dispatch
       return scope.dispatch(new MyCommand(...)); 
   }
}
```

## 3. Topologies Redefined

### 3.1 The Edge (Ingress)
*   **Purpose:** Sanitization & Routing.
*   **Enforcement:** Has `IngressScope`. **Powerless** to change state. Must delegate.

### 3.2 The Core (Domain)
*   **Purpose:** Logic & State.
*   **Enforcement:** Has `DomainScope`. **Authorized** to change state via Policy.

### 3.3 The Mesh (Adapters/Stream)
*   **Purpose:** I/O.
*   **Enforcement:** Has `EgressScope`. **Observer/Side-Effect** only.

## 4. Does the "Adapter Hexagon" exist?
**No.** It is not a topological peer to the Domain. 
It is a **Service** consumed by the Domain (via EgressScope or Dependency Injection). 
There is no "Adapter Hexagon" archetype; there are just **Secondary Ports** implementation details.


**Status:** Proposed
**Context:** Enforcing architectural patterns at the Module level.
**Dependencies:** Proposal 003 (Strict Suite).

## 1. The Concept
We move beyond "Strict Components" to **"Strict Topologies"**.
We categorize every Hexagon (Module) into an **Archetype**. 
Each Archetype has strict rules about:
1.  **Content:** What classes it can contain.
2.  **Connectivity:** What other Hexagons it can talk to.
3.  **Trust Level:** How much we trust its inputs.

## 2. The Archetypes

### 2.1 The Edge Hexagon (Ingress)
The "Bouncer". Low Trust.
*   **Role:** Protocol Translation, Sanitization, Scope Creation.
*   **Allowed Content:** `StrictPrimaryAdapter`, `ZodSchema`, `DTOs`.
*   **Forbidden:** `StrictEntity` (No domain logic), `StrictRepository` (No DB access).
*   **Input:** `Unknown` (Raw HTTP/CLI).
*   **Output:** `Typed Command` / `Typed Query`.
*   **Connectivity:** Can call -> `Domain Hexagon` / `Stream Hexagon`.

### 2.2 The Domain Hexagon (Core)
The "Brain". High Trust.
*   **Role:** Business Logic, Decision Making, State Evolution.
*   **Allowed Content:** `StrictUseCase`, `StrictEntity`, `StrictPolicy`, `StrictRepository`.
*   **Forbidden:** `StrictPrimaryAdapter` (No HTTP handlers), `StrictSecondaryAdapter` (No raw external calls).
*   **Input:** `Typed Command` (from Edge) + `OperationScope`.
*   **Output:** `StrictEntity` / `Result`.
*   **Connectivity:** Can call -> `Repository` (Internal) / `Adapter Hexagon`.

### 2.3 The Stream Hexagon (Projector)
The "Observer". Read-Only Trust.
*   **Role:** Projections, Read Models, Analytics.
*   **Allowed Content:** `StrictProjector`, `ReadModel`.
*   **Forbidden:** `StrictUseCase` (No writes), `StrictPolicy`.
*   **Input:** `DomainEvent`.
*   **Output:** `Void` (Side Effects / DB Writes).
*   **Connectivity:** Listens to -> `Domain`.

### 2.4 The Adapter Hexagon (Egress)
The "Mouthpiece". System Trust.
*   **Role:** External Communication.
*   **Allowed Content:** `StrictSecondaryAdapter`.
*   **Connectivity:** Called by -> `Domain`.

## 3. The Trust Gradient Matrix

| From \ To | Edge | Domain | Stream | Adapter |
| :--- | :---: | :---: | :---: | :---: |
| **Edge** | ❌ | ✅ | ✅ | ❌ |
| **Domain** | ❌ | ✅ (Sub-domain) | ❌ | ✅ |
| **Stream** | ❌ | ❌ | ❌ | ❌ |
| **Adapter** | ❌ | ❌ | ❌ | ❌ |

## 4. Enforcement strategies
We can enforce this via directory structure and linting.

```
src/
  edge/       # Enforce: No Entities, No Repos
    http-api/
  domain/     # Enforce: No Express/Nest imports
    kitchen/
    payment/
  stream/     # Enforce: Projectors only
    analytics/
  resources/  # Adapters/Repos
    postgres/
    stripe/
```
