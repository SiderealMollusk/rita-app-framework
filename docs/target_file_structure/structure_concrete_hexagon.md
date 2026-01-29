# Concrete Hexagon Example (Orders)

This is an example of the **Orders Hexagon**, using the approved framework terms.

```
hexagons/
  orders/
    hexagon.yaml
    module.ts

    src/
      domain/
        Order.ts
        OrderPolicy.ts
        OrderSchema.ts               # Zod schema for Order data/validation
        OrderEvents.ts
        domain_errors.ts

      application/
        commands/
          PlaceOrder.ts              # extends CommandUseCase
          ApproveOrder.ts
        queries/
          GetOrder.ts                # extends QueryUseCase
          ListOrders.ts
        ports/
          secondary/
            persistence/
              OrderWriteRepoPort.ts
              OrderReadRepoPort.ts
              OrderUnitOfWorkPort.ts # Defines transaction boundary for Orders
            messaging/
              EventBusPort.ts
            clock/
              ClockPort.ts

      read_model/
        models/
          OrderView.ts               # denormalized view shape
        projections/
          ProjectOrderView.ts        # updates OrderView on OrderPlaced, OrderApproved
        queries/
          OrderViewQueries.ts        # optional helper(s), read-only

      adapters/
        primary/
          http/
            OrdersHttp.ts            # routes -> CommandUseCase/QueryUseCase
          worker/
            OrdersWorker.ts          # consumes events/commands -> CommandUseCase
        secondary/
          persistence/
            write/
              PostgresOrderWriteRepo.ts
              PostgresOrderUoW.ts
            read/
              PostgresOrderReadRepo.ts    # can be same DB initially; still separate interface
          messaging/
            NatsEventBus.ts
          clock/
            SystemClockAdapter.ts         # wraps RitaClock if you allow system time at edge

    test/
      unit/
        commands/
          PlaceOrder.test.ts
        queries/
          GetOrder.test.ts
        domain/
          OrderPolicy.test.ts
      integration/
        projections/
          ProjectOrderView.test.ts
      e2e/
        http/
          OrdersHttp.test.ts
```
