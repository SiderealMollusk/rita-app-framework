export interface Clock {
    now(): Date;
    timestamp(): number;
}

export class RealClock implements Clock {
    now(): Date {
        return new Date();
    }
    timestamp(): number {
        return Date.now();
    }
}

export class FixedClock implements Clock {
    constructor(private readonly fixedTime: Date) { }
    now(): Date {
        return new Date(this.fixedTime);
    }
    timestamp(): number {
        return this.fixedTime.getTime();
    }
}

/**
 * Global Clock Accessor.
 * Use this instead of `new Date()`.
 */
export class RitaClock {
    private static strategy: Clock = new RealClock();

    static now(): Date {
        return this.strategy.now();
    }

    static timestamp(): number {
        return this.strategy.timestamp();
    }

    /**
     * Set a fixed time for testing.
     */
    static mock(fixedTime: Date): void {
        this.strategy = new FixedClock(fixedTime);
    }

    /**
     * Reset to system time.
     */
    static reset(): void {
        this.strategy = new RealClock();
    }
}
