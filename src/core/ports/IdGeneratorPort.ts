export interface IdGeneratorPort {
    generate(prefix?: string): string;
}
