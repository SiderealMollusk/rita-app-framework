import { HexagonSpec } from './HexagonSpec';

/**
 * Handles loading and validation of Hexagon specifications.
 */
export class HexagonLoader {
    /**
     * Validates a spec at runtime.
     */
    static validate(spec: HexagonSpec): HexagonSpec {
        if (!spec.name) throw new Error('Hexagon must have a name');
        if (!spec.version) throw new Error('Hexagon must have a version');
        return Object.freeze(spec);
    }
}
