export type Newable = { new(...args: any[]): any };

/**
 * Structural definition of a Hexagon (Module).
 */
export interface HexagonSpec {
    name: string;
    version: string;
    description?: string;
    primaryAdapters: Newable[];
    useCases: Newable[];
    policies: Newable[];
    secondaryPorts: Newable[];
    secondaryAdapters: Newable[];
}
