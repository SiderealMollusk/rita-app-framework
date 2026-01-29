import { BaseUseCase } from './BaseUseCase';
import { BaseComponent } from './BaseComponent';
import { ContextFactory } from '../context/promotion/ContextFactory';
import { CommandCtx } from '../context/CommandCtx';
import { UnitOfWorkPort } from '../ports/UnitOfWorkPort';

/**
 * State-mutating Use Case.
 */
export abstract class CommandUseCase<TIn, TOut> extends BaseUseCase<TIn, TOut> {
    constructor(protected readonly uowPort?: UnitOfWorkPort) {
        super();
    }

    protected async executeCommand<UIn, UOut>(
        component: BaseComponent<UIn, UOut>,
        input: UIn,
        principal?: string
    ): Promise<UOut> {
        const external = ContextFactory.createExternal();
        const internal = ContextFactory.promoteToInternal(external, principal);

        let uow;
        if (this.uowPort) {
            const tempCommand = ContextFactory.promoteToCommand(internal);
            uow = await this.uowPort.start(tempCommand);
        }

        const command = ContextFactory.promoteToCommand(internal, uow);

        try {
            const result = await this.executeComponent(component, command, input);
            if (uow) await uow.commit();
            return result;
        } catch (err) {
            if (uow) await uow.rollback();
            throw err;
        } finally {
            if (uow) await uow.close();
        }
    }
}
