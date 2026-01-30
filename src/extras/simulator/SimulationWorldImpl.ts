import { SimulationWorld } from './SimulatorSkeleton';
import {
    SimulatedClock,
    SimulatedRandom,
    InMemoryEventBus,
    ContextFactory,
    RitaClock,
    RitaId,
    Logger,
    IdGeneratorPort
} from '../../core';

export class SimulationWorldImpl implements SimulationWorld {
    public adapters: Record<string, any> = {};
    private useCases: Map<string, any> = new Map();

    constructor(
        public clock: SimulatedClock,
        public random: SimulatedRandom,
        public eventBus: InMemoryEventBus,
        public idGen: IdGeneratorPort
    ) {
        // Apply overrides
        RitaClock._setTestClock(this.clock);
        RitaId._setTestIdGenerator(this.idGen);
    }

    public registerUseCase(name: string, useCase: any) {
        this.useCases.set(name, useCase);
    }

    public async dispatch(actor: string, intent: string, payload: any): Promise<any> {
        Logger.info(`[Sim: Act]`, { actor, intent, payload });
        const useCase = this.useCases.get(intent);
        if (!useCase) throw new Error(`UseCase not found: ${intent}`);

        // UseCases in RITA manage their own context promotion from their 'run' method.
        return await useCase.run(payload);
    }

    public async query(queryName: string, params: any): Promise<any> {
        const useCase = this.useCases.get(queryName);
        if (!useCase) throw new Error(`Query not found: ${queryName}`);

        return await useCase.run(params);
    }

    public async settle(): Promise<void> {
        await this.clock.runUntilIdle();
    }
}
