/**
 * The "Manifest" Validator.
 * 
 * In a Hexagonal Architecture, wiring is key.
 * This class serves as a runtime check (and documentation)
 * for the application structure.
 */
export type Newable = { new(...args: never[]): unknown };

export type HexagonConfig = {
    name: string;
    primaryAdapter: Newable;
    application: Newable;
    ports: Newable | Record<string, Newable>;
    secondaryAdapters: Newable[];
};



export class Hexagon {
    /**
      * Defines and validates a Pod/Context.
      * 
      * @param config The structural definition
      * @returns The validated config (frozen)
      */
    static define(config: HexagonConfig): Readonly<HexagonConfig> {
        if (!config.name) throw new Error("Hexagon must have a name");

        // In the future, we can add reflection checks here 
        // e.g., ensure all Interactions actually extend BaseInteraction

        return Object.freeze(config);
    }
}
