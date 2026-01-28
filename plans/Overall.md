Framework Implementation Order

This document outlines the strict dependency sequence for bootstrapping the Agent-First Framework.
Do not skip steps. Each layer relies on the types and runtime behavior of the layer below it.

Phase 1: The Foundation (The Invisible Railings)

Goal: Create the base classes that enforce the "Skinner Box" rules. Without these, the Agent has no constraints.

1.1. Telemetry & logging (/src/system/telemetry)

Why: The BaseComponent relies on a global Logger and Tracer being available to inject.

Task: Create a simple wrapper around console (or OpenTelemetry) that supports structured logging (info, error, debug with metadata objects).

1.2. The Logic Wrapper (/src/system/BaseComponent.ts)

Why: Every Use Case needs this class to extend.

Task: Implement the execute() template method that handles:

Start Span.

Try/Catch.

_run() delegation.

1.3. The Data Primitive (/src/system/DomainEntity.ts)

Why: You cannot pass data around without this.

Task: Implement the StrictImmutableDTO (or DomainEntity) class.

Crucial: Implement the captureStackTrace() logic in the constructor.

Crucial: Implement the .with() method with the mandatory reason check.

Phase 2: The Observables (The Narrative Engine)

Goal: Enable the "Logic as Data" system. This prevents Agents from writing hidden if statements.

2.1. The Wrapper (/src/system/observables/Val.ts)

Why: Logic needs to track the source of values.

Task: Implement the Val<T> type and the wrap() helper function.

2.2. The Operators (/src/system/observables/Ops.ts)

Why: We need a restricted list of verbs.

Task: Implement the Ops Enum (GT, LT, EQ, IN).

2.3. The Logic Engine (/src/system/DecisionMutator.ts)

Why: This runs the DecisionSpec.

Task: Implement the class that accepts a DecisionSpec, evaluates left op right, logs the result, and executes trueFn/falseFn.

Phase 3: The Boundaries (The Hexagon)

Goal: Define the "Sockets" and "Plugs" for features.

3.1. Inbound Base (/src/system/BaseInteraction.ts)

Task: Create the abstract class for Controllers. Ensure it enforces the parse -> handle flow.

3.2. Outbound Base (/src/system/BaseGateway.ts)

Task: Create the abstract class for Adapters. Implement the safeExecute wrapper for external calls.

3.3. The Definition Primitive (/src/system/Hexagon.ts)

Task: Create the Hexagon.define() static method.

Crucial: Add TypeScript generics to enforce that driven dependencies are strictly Abstract Classes.

3.4. The Test Primitive (/src/system/BehaviorSpec.ts)

Task: Define the Scenario type (Given/Expect).

Phase 4: The Pilot Feature (Proof of Concept)

Goal: Prove the framework works by implementing "Place Order".

4.1. The Contract (/src/features/place-order/hex.ts)

Task: Create the Hexagon.define file first. Use empty classes/interfaces placeholders to satisfy the compiler. This sets the "Shape."

4.2. The Behavior (/src/features/place-order/PlaceOrder.spec.ts)

Task: Write the TDD scenarios using BehaviorSpec.

4.3. The Evidence (/src/features/place-order/model/OrderEntity.ts)

Task: Implement the Entity extending DomainEntity.

4.4. The Narrative (/src/features/place-order/policies/ApplyHighValue.ts)

Task: Implement a DecisionMutator.

4.5. The Core (/src/features/place-order/PlaceOrderUseCase.ts)

Task: Implement _run(), wire the Entity and Policy together.

4.6. The Trigger (/src/features/place-order/adapters/in/PlaceOrderController.ts)

Task: Implement the Inbound Adapter to parse JSON and call the Core.

Phase 5: The Wiring (Runtime)

Goal: Boot the machine.

5.1. The Manifest (/config/app.wiring.yaml)

Task: specific definitions for the Place Order feature.

5.2. The Bootstrapper (/src/main.ts)

Task: Write the script that:

Reads the YAML.

Instantiates the HTTP Listener (Express/Fastify).

Iterates through the Hexagon definitions.

Injects dependencies (constructor injection).

Binds BaseInteraction classes to HTTP routes.