# Framework Runtime (src/core)

This describes the file structure of the `src/core` directory, which contains the framework's kernel.

```
src/
  core/
    context/
      SystemCtx.ts
      ExternalCtx.ts
      InternalCtx.ts
      CommandCtx.ts
      CapabilityBag.ts
      capabilities/
        CommitCap.ts
        RawQueryCap.ts
        AdminCap.ts
      promotion/
        ContextFactory.ts
        promoteExternalToInternal.ts
        promoteInternalToCommand.ts
        promoteToSystem.ts

    execution/
      BaseComponent.ts
      BaseUseCase.ts                 # (renamed from BaseInteraction)
      CommandUseCase.ts
      QueryUseCase.ts

    domain/
      BaseValueObject.ts
      BaseEntity.ts                  # if/when you introduce entities vs VOs
      DecisionPolicy.ts
      PolicyToken.ts
      RitaClock.ts

    adapters/
      BasePrimaryAdapter.ts          # External entrypoint base
      BaseSecondaryAdapter.ts        # (renamed from BaseGateway)
      BaseRepository.ts              # (recommended) typed read/write gates
      AdminRepository.ts             # (recommended) raw/system gated escape hatch
      UnitOfWork.ts                  # Transaction coordinator implementation

    ports/
      PrimaryPort.ts                 # Marker interface for Ingress
      SecondaryPort.ts               # Marker interface for Adapters
      UnitOfWorkPort.ts              # Transaction/Atomicity contract
      ClockPort.ts                   # Time abstraction interface

    validation/
      Schema.ts                      # Zod facade & standard types

    errors/
      KernelError.ts
      AgentGuidanceError.ts          # AI-specific fix instructions
      DomainValidationError.ts
      NotFoundError.ts
      BusinessRuleViolationError.ts
      UnauthorizedError.ts
      ForbiddenError.ts
      DependencyFailureError.ts

    telemetry/
      Logger.ts
      Tracer.ts
      Span.ts

    hexagon/
      HexagonSpec.ts                 # typed schema for “hexagon-on-disk”
      HexagonLoader.ts               # loads YAML/JSON spec + calls module.ts factory
      HexagonRegistry.ts             # indexes available hexagons/modules
      RoleModel.ts                   # Primary/Secondary terminology + module roles

    enforcement/
      ArchitectureGuard.ts
      rules/
        ForbiddenApisRule.ts
        ImportBoundaryRule.ts
        TraceShapeRule.ts
        CapabilityRule.ts
      cli/
        rita-guard.ts
```

## Notes
*   This includes the “CQRS harder” direction by making QueryUseCase and CommandUseCase first-class.
*   HexagonSpec is the typed representation of the YAML/JSON. The YAML itself lives in the app’s hexagon folder.
