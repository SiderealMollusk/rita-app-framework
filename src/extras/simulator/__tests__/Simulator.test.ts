import { SimulationWorldImpl } from '../SimulationWorldImpl';
import { ScenarioRunner, Scenario } from '../SimulatorSkeleton';
import { SimulatedClock, SimulatedRandom, InMemoryEventBus, SimulatedIdGenerator } from '../../../core';

describe('Simulator Engine', () => {
    let clock: SimulatedClock;
    let random: SimulatedRandom;
    let eventBus: InMemoryEventBus;
    let idGen: SimulatedIdGenerator;
    let world: SimulationWorldImpl;
    let runner: ScenarioRunner;

    beforeEach(() => {
        clock = new SimulatedClock();
        random = new SimulatedRandom(1);
        eventBus = new InMemoryEventBus();
        idGen = new SimulatedIdGenerator();
        world = new SimulationWorldImpl(clock, random, eventBus, idGen);
        runner = new ScenarioRunner(world);
    });

    it('should execute a simple scenario', async () => {
        const mockUseCase = {
            run: jest.fn().mockResolvedValue({ success: true })
        };
        world.registerUseCase('TestIntent', mockUseCase);

        const scenario: Scenario = {
            name: 'Test Scenario',
            seed: 1,
            steps: [
                { kind: 'act', actor: 'Tester', intent: 'TestIntent', payload: { foo: 'bar' } },
                { kind: 'assert', query: 'TestIntent', params: { foo: 'bar' }, expect: { success: true } }
            ]
        };

        await runner.play(scenario);

        expect(mockUseCase.run).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should advance clock on wait step', async () => {
        const scenario: Scenario = {
            name: 'Wait Scenario',
            seed: 1,
            steps: [
                { kind: 'wait', ms: 1000 }
            ]
        };

        const startTime = clock.now().getTime();
        await runner.play(scenario);
        const endTime = clock.now().getTime();

        expect(endTime - startTime).toBe(1000);
    });

    it('should fail on assertion failure', async () => {
        const mockUseCase = {
            run: jest.fn().mockResolvedValue({ success: false })
        };
        world.registerUseCase('TestQuery', mockUseCase);

        const scenario: Scenario = {
            name: 'Fail Scenario',
            seed: 1,
            steps: [
                { kind: 'assert', query: 'TestQuery', params: {}, expect: { success: true } }
            ]
        };

        await expect(runner.play(scenario)).rejects.toThrow('Assertion failed');
    });

    it('should settle after act', async () => {
        let settled = false;
        const mockUseCase = {
            run: async () => {
                clock.schedule(async () => { settled = true; }, 0);
            }
        };
        world.registerUseCase('TestAct', mockUseCase);

        const scenario: Scenario = {
            name: 'Settle Scenario',
            seed: 1,
            steps: [
                { kind: 'act', actor: 'Tester', intent: 'TestAct', payload: {} }
            ]
        };

        await runner.play(scenario);
        expect(settled).toBe(true);
    });
});
