import { BaseUseCase } from './BaseUseCase';
import { BaseComponent } from './BaseComponent';
import { ContextFactory } from '../context/promotion/ContextFactory';
import { CommandCtx } from '../context/CommandCtx';

/**
 * State-mutating Use Case.
 */
export abstract class CommandUseCase<TIn, TOut> extends BaseUseCase<TIn, TOut> {
    protected async executeCommand<UIn, UOut>(
        component: BaseComponent<UIn, UOut>,
        input: UIn,
        principal?: string
    ): Promise<UOut> {
        const external = ContextFactory.createExternal();
        const internal = ContextFactory.promoteToInternal(external, principal);
        const command = ContextFactory.promoteToCommand(internal);
        return this.executeComponent(component, command, input);
    }
}
