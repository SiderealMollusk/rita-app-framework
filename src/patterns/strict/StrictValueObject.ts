import { BaseValueObject, Provenance } from '../../core/domain/BaseValueObject';
import { Strict } from './types';

/**
 * A StrictValueObject ensures immutability and adheres to the Strict pattern.
 */
export abstract class StrictValueObject<TData> extends BaseValueObject<TData> implements Strict {
    public readonly _strictVersion = 1;

    protected constructor(data: TData, provenance?: Provenance<TData>, rev?: number) {
        super(data, provenance, rev);
    }
}
