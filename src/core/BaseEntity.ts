import { BaseValueObject } from './BaseValueObject';

/**
 * Base Entity.
 * 
 * Inherits all provenance traits from BaseValueObject.
 * Adds Identity concept (ID).
 * 
 * Note: In this framework, Entities are *also* immutable records.
 * You don't mutate an Entity in place; you evolve it.
 */
export abstract class BaseEntity<TSchema extends { id: string }> extends BaseValueObject<TSchema> {

    public get id(): string {
        return this._data.id;
    }

    public equals(other: BaseEntity<TSchema>): boolean {
        if (!(other instanceof BaseEntity)) return false;
        return this.id === other.id;
    }
}
