import { IdGeneratorPort } from '../ports/IdGeneratorPort';

export class SimulatedIdGenerator implements IdGeneratorPort {
    private counters: Map<string, number> = new Map();

    generate(prefix: string = 'id'): string {
        const current = this.counters.get(prefix) || 0;
        const next = current + 1;
        this.counters.set(prefix, next);
        return `${prefix}-${next}`;
    }

    reset(): void {
        this.counters.clear();
    }
}
