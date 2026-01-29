# Generic Hexagon Template (CQRS Harder)

This is the template for a generic hexagon within the application. Every hexagon should be able to express:
*   primary adapters → primary ports
*   command vs query separation
*   read model / projection path
*   event emission path
*   secondary adapters only on the edge

```
hexagons/
  <hexagon_name>/
    hexagon.yaml
    module.ts

    src/
      core/                          # optional: tiny local helpers only (avoid if possible)

      domain/
        entities/
        value_objects/
        policies/
        schemas/                     # Zod definitions for domain/DTOs
        events/
        errors/

      application/
        commands/
          <CommandUseCase>.ts
        queries/
          <QueryUseCase>.ts
        ports/
          primary/
            commands/
            queries/
          secondary/
            persistence/
              UnitOfWorkPort.ts
            external/
            messaging/
            clock/

      read_model/
        models/                      # read-side shapes (denormalized)
        projections/                 # build/update read models from events or DB changes
        queries/                     # optional: read-model query helpers

      adapters/
        primary/
          http/
          cli/
          worker/
        secondary/
          persistence/
            write/                   # command-side repositories
            read/                    # query-side read stores (can be different DB)
          external/
          messaging/

    test/
      unit/
        domain/
        policies/
        commands/
        queries/
      integration/
        adapters/
        projections/
      e2e/
        http/
        worker/
```

## "CQRS Harder" Implications
*   Command side and Query side are separated in both application code and persistence adapters.
*   Read model exists explicitly (even if it’s backed by the same DB at first).
*   Projections are a named place, not “random mapper code.”
