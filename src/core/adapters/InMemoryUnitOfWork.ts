import { UnitOfWork, UnitOfWorkPort } from '../ports/UnitOfWorkPort';
import { CommandCtx } from '../context/CommandCtx';
import { CommitCap } from '../context/capabilities/CommitCap';

export class InMemoryUnitOfWork implements UnitOfWork {
    public async commit(): Promise<void> { /* no-op */ }
    public async rollback(): Promise<void> { /* no-op */ }
    public async close(): Promise<void> { /* no-op */ }
}

export class InMemoryUnitOfWorkFactory implements UnitOfWorkPort {
    public async start(ctx: CommandCtx): Promise<UnitOfWork> {
        ctx.capabilities.require(CommitCap);
        return new InMemoryUnitOfWork();
    }
}
