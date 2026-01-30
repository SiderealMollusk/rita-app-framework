import { IdGeneratorPort } from '../ports/IdGeneratorPort';
import { UuidIdGenerator } from '../adapters/UuidIdGenerator';

export class RitaId {
    private static instance: IdGeneratorPort = new UuidIdGenerator();

    public static generate(prefix?: string): string {
        return this.instance.generate(prefix);
    }

    public static _setTestIdGenerator(idGen: IdGeneratorPort): void {
        this.instance = idGen;
    }

    public static _reset(): void {
        this.instance = new UuidIdGenerator();
    }
}
