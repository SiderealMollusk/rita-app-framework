Based on the Framework Component Catalog in the Canvas, here is the breakdown of every moment where the framework performs "Invisible Logging."

These are the specific lifecycle events where the Agent writes zero logging code, yet the system generates a detailed audit trail.

1. The "Data Born" Event

Trigger: new OrderEntity(...)

Primitive: DomainEntity

The Log: The framework captures the Stack Trace immediately upon instantiation.

What you see: [Data Born] OrderEntity created at PlaceOrderUseCase.ts:42.

2. The "Orchestration" Events (Spans)

Trigger: Calling useCase.execute(input)

Primitive: BaseComponent

The Log:

Start: [Started] PlaceOrderUseCase (Plus input args).

End: [Completed] PlaceOrderUseCase (Plus timing duration).

Error: [Failed] PlaceOrderUseCase (Plus full error context).

3. The "Logic Narrative" Events

Trigger: Running a DecisionMutator (Policy).

Primitive: DecisionMutator + Ops

The Log: Instead of silent execution, every comparison is printed.

[Op] Order.total (150) > 100 == true

[Op] User.status ('VIP') === 'VIP' == true

4. The "Evolution" Event

Trigger: Calling entity.with(changes, reason)

Primitive: DomainEntity

The Log: The "Reasoned Mutation" log.

[Data Evolved] OrderEntity

Diff: { status: 'PAID' }

Reason: "Stripe Webhook Confirmed"

5. The "External Call" Event

Trigger: Calling safeExecute(() => api.post(...))

Primitive: BaseGateway

The Log: Logs the external attempt and outcome, isolating infrastructure failures from domain logic.