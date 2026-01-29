import { HexagonSpec } from './HexagonSpec';

/**
 * Global registry of loaded hexagons.
 */
export class HexagonRegistry {
    private static hexagons = new Map<string, HexagonSpec>();

    static register(spec: HexagonSpec): void {
        this.hexagons.set(spec.name, spec);
    }

    static get(name: string): HexagonSpec | undefined {
        return this.hexagons.get(name);
    }

    static clear(): void {
        this.hexagons.clear();
    }
}
