Framework Component Catalog

This is the definitive list of Base Classes available in the System Kernel.
Rule: Every class you write must extend one of these primitives. "Loose" classes are forbidden.

1. The Logic Primitives (The "Brain")

BaseComponent<In, Out>

What: The orchestrator base. Used for Use Cases.

Usage: class PlaceOrder extends BaseComponent<OrderInput, OrderEntity>

The "Why" (Constraint):

Telemetry: Automatically starts/ends Tracing Spans.

Safety: Wraps all logic in a standardized try/catch.

Logging: Automatically logs [Started] and [Completed] so you don't have to.

DecisionMutator<Target, Context>

What: The business rule engine. Used for Policies.

Usage: class ApplyDiscount extends DecisionMutator<OrderEntity, void>

The "Why" (Constraint):

Observability: Forces logic to be declarative (Ops.GT).

No Hidden Ifs: Prevents business rules from being buried in private methods.

Narrative: Generates the "Story" of the execution in the logs.

2. The Boundary Primitives (The "Skin")

BaseInteraction<Raw, Clean>

What: The inbound adapter. Used for Controllers, CLI Commands, Consumers.

Usage: class PlaceOrderController extends BaseInteraction<HttpBody, void>

The "Why" (Constraint):

Isolation: The type signature only accepts a BaseComponent as a dependency. You physically cannot inject a Database here.

Flow: Enforces the parse() -> handle() lifecycle.

BaseGateway<PortInterface>

What: The outbound adapter. Used for Repositories, API Clients.

Usage: class StripeAdapter extends BaseGateway<IPaymentGateway>

The "Why" (Constraint):

Error Normalization: Provides safeExecute() helper to catch messy vendor errors (Axios/SQL) and convert them to clean Domain Errors.

Compliance: Enforces that you implement the Domain Port, not just a random set of methods.

3. The Data Primitives (The "Evidence")

DomainEntity<T>

What: The state container. Used for Aggregates, Entities, DTOs.

Usage: class OrderEntity extends DomainEntity<OrderSchema>

The "Why" (Constraint):

Provenance: Constructor captures the Stack Trace ("Data Born").

Immutability: Prevents order.status = 'PAID'.

Intent: Forces usage of .with(changes, reason) so every change has a business reason string.

BehaviorSpec<In, Out>

What: The test definition. Used for TDD Scenarios.

Usage: class PlaceOrderSpec extends BehaviorSpec<In, Out>

The "Why" (Constraint):

Requirement: Acts as the "Contract" that the Hexagon definition demands before compiling.

Standardization: Forces tests into Given / Expect data structures rather than loose Jest code.

4. The Definition Primitives (The "Map")

Hexagon

What: The Feature Pod configuration object.

Usage: const PlaceOrderHex = Hexagon.define({ ... })

The "Why" (Constraint):

Discovery: A single file (hex.ts) that lists inputs, logic, and outputs.

Validation: Compiles only if the Spec, Core, and Ports match up.

Ops (Enum)

What: The allowed logical operators.

Usage: Ops.GT, Ops.EQ, Ops.IN.

The "Why" (Constraint):

Logging: Allows the framework to print 100 > 50 in the logs. Native JS operators (>) are silent.