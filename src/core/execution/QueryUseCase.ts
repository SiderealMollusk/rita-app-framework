import { BaseUseCase } from './BaseUseCase';
import { BaseComponent } from './BaseComponent';
import { ContextFactory } from '../context/promotion/ContextFactory';
import { InternalCtx } from '../context/InternalCtx';

/**
 * Read-only Use Case.
 */
export abstract class QueryUseCase<TIn, TOut> extends BaseUseCase<TIn, TOut> {
    protected async executeQuery<UIn, UOut>(
        component: BaseComponent<UIn, UOut>,
        input: UIn,
        principal?: string
    ): Promise<UOut> {
        const external = ContextFactory.createExternal();
        const internal = ContextFactory.promoteToInternal(external, principal);
        return this.executeComponent(component, internal, input);
    }
}
