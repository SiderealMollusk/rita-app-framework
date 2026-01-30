import { BaseEntity } from '../../core/domain/BaseEntity';
import { Provenance } from '../../core/domain/BaseValueObject';
import { PolicyToken } from '../../core/domain/PolicyToken';
import { UnauthorizedError } from '../../core/errors/UnauthorizedError';
import { Strict } from './types';

/**
 * A StrictEntity enforces that creation and state changes
 * occur only within authorized DecisionPolicies.
 */
export abstract class StrictEntity<TData, TId = string> extends BaseEntity<TData, TId> implements Strict {
    public readonly _strictVersion = 1;

    /**
     * Protected constructor to prevent direct instantiation.
     */
    protected constructor(id: TId, data: TData, provenance?: Provenance<TData>, rev?: number) {
        super(id, data, provenance, rev);
    }

    /**
     * The ONLY way to create a new StrictEntity.
     * Requires a valid PolicyToken, which should only be available inside a DecisionPolicy.
     */
    protected static createInstance<T extends StrictEntity<any, any>>(
        this: any,
        token: PolicyToken,
        id: any,
        data: any
    ): T {
        if (!PolicyToken.isAuthorized(token)) {
            throw new UnauthorizedError("Only a DecisionPolicy can create a StrictEntity.");
        }
        // @ts-ignore
        return new this(id, data);
    }
}
