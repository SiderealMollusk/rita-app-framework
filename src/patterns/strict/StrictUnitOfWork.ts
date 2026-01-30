import { UnitOfWork } from '../../core/ports/UnitOfWorkPort';
import { Strict } from './types';

/**
 * StrictUnitOfWork extends the base UnitOfWork to provide
 * type-safe access to repositories.
 *
 * Subclasses/Implementations should add specific repository getters.
 */
export interface StrictUnitOfWork extends UnitOfWork, Strict {
    readonly _strictVersion: 1;
}
