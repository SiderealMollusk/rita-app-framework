import { StrictEntity } from './StrictEntity';
import { Strict } from './types';

/**
 * StrictRepository defines the contract for persisting StrictEntities.
 * Access should generally be through the StrictUnitOfWork.
 */
export interface StrictRepository<T extends StrictEntity<any, any>> extends Strict {
    readonly _strictVersion: 1;
    save(entity: T): Promise<void>;
}
