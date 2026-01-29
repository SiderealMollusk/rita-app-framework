export interface ClockPort {
    /**
     * Returns the current date and time.
     */
    now(): Date;

    /**
     * Advances the clock by a specific number of milliseconds.
     * Only supported by simulation-capable clocks.
     */
    advance?(ms: number): Promise<void>;

    /**
     * Runs until no scheduled tasks remain.
     * Only supported by simulation-capable clocks.
     */
    runUntilIdle?(): Promise<void>;

    /**
     * Schedules a task to be executed after a delay.
     */
    schedule?(callback: () => Promise<void>, delayMs: number): void;
}
