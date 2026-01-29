import { ClockPort } from '../ports/ClockPort';

/**
 * A clock implementation for deterministic simulations.
 */
export class SimulatedClock implements ClockPort {
    private currentTimeMs: number;
    private queue: { callback: () => Promise<void>, timeMs: number }[] = [];

    constructor(initialTimeMs: number = 0) {
        this.currentTimeMs = initialTimeMs;
    }

    private sortQueue(): void {
        this.queue.sort((a, b) => a.timeMs - b.timeMs);
    }

    private async flushMicrotasks(): Promise<void> {
        await new Promise(resolve => process.nextTick(resolve));
    }

    public now(): Date {
        return new Date(this.currentTimeMs);
    }

    public async advance(ms: number): Promise<void> {
        const targetTime = this.currentTimeMs + ms;

        while (true) {
            this.sortQueue();
            const nextTask = this.queue[0];

            if (!nextTask || nextTask.timeMs > targetTime) {
                break;
            }

            this.queue.shift();
            this.currentTimeMs = nextTask.timeMs;
            await nextTask.callback();
            await this.flushMicrotasks();
        }

        this.currentTimeMs = targetTime;
    }

    public async runUntilIdle(): Promise<void> {
        while (this.queue.length > 0) {
            this.sortQueue();
            const nextTask = this.queue.shift()!;
            this.currentTimeMs = nextTask.timeMs;
            await nextTask.callback();
            await this.flushMicrotasks();
        }
    }

    public schedule(callback: () => Promise<void>, delayMs: number): void {
        this.queue.push({
            callback,
            timeMs: this.currentTimeMs + delayMs
        });
    }
}
