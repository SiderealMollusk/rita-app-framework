export interface Span {
    traceId: string;
    end(): void;
    recordException(err: Error): void;
}
