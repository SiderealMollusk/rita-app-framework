/**
 * Deterministic seeded random number generator.
 * LCG implementation for simplicity and predictability.
 */
export class SimulatedRandom {
    private seed: number;

    constructor(seed: number = 1) {
        this.seed = seed;
    }

    /**
     * Returns a float between 0 and 1.
     */
    public next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    /**
     * Returns true if a failure should occur based on probability.
     */
    public shouldFail(probability: number): boolean {
        return this.next() < probability;
    }
}
