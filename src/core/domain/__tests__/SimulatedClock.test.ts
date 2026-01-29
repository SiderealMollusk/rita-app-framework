import { SimulatedClock } from '../SimulatedClock';

describe('SimulatedClock', () => {
    it('should initialize with default time if not provided', () => {
        const clock = new SimulatedClock();
        expect(clock.now().getTime()).toBe(0);
    });

    it('should return the current time', () => {
        const clock = new SimulatedClock(1000);
        expect(clock.now().getTime()).toBe(1000);
    });

    it('should advance time', async () => {
        const clock = new SimulatedClock(0);
        await clock.advance(500);
        expect(clock.now().getTime()).toBe(500);
    });

    it('should execute scheduled tasks when advancing', async () => {
        const clock = new SimulatedClock(0);
        const task = jest.fn().mockResolvedValue(undefined);

        clock.schedule(task, 100);
        await clock.advance(200);

        expect(task).toHaveBeenCalled();
        expect(clock.now().getTime()).toBe(200);
    });

    it('should execute tasks in chronological order', async () => {
        const clock = new SimulatedClock(0);
        const executionOrder: number[] = [];

        // Use multiple tasks to ensure sort comparator is covered
        clock.schedule(async () => { executionOrder.push(200); }, 200);
        clock.schedule(async () => { executionOrder.push(100); }, 100);
        clock.schedule(async () => { executionOrder.push(150); }, 150);

        await clock.advance(300);

        expect(executionOrder).toEqual([100, 150, 200]);
    });

    it('should run until idle', async () => {
        const clock = new SimulatedClock(0);
        const task1 = jest.fn().mockResolvedValue(undefined);
        const task2 = jest.fn().mockImplementation(async () => {
            clock.schedule(task1, 100);
        });

        clock.schedule(task2, 100);
        await clock.runUntilIdle();

        expect(task2).toHaveBeenCalled();
        expect(task1).toHaveBeenCalled();
        expect(clock.now().getTime()).toBe(200);
    });

    it('should handle advancing past multiple tasks', async () => {
        const clock = new SimulatedClock(0);
        let count = 0;
        clock.schedule(async () => { count++; }, 100);
        clock.schedule(async () => { count++; }, 200);
        await clock.advance(300);
        expect(count).toBe(2);
    });

    it('should not execute tasks in the future when advancing', async () => {
        const clock = new SimulatedClock(0);
        const task = jest.fn().mockResolvedValue(undefined);
        clock.schedule(task, 500);
        await clock.advance(200);
        expect(task).not.toHaveBeenCalled();
        expect(clock.now().getTime()).toBe(200);
    });
});
