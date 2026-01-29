import { SimulationWorld } from './SimulatorSkeleton';
import { SimulationWorldImpl } from './SimulationWorldImpl';
import {
    SimulatedClock,
    SimulatedRandom,
    InMemoryEventBus,
    UnitOfWorkFactory,
    InMemoryRepository
} from '../../core';

import { PlaceOrder } from '../../demos/sims/v2/L1_Atomic/usecases/PlaceOrder';
import { StartCooking } from '../../demos/sims/v2/L1_Atomic/usecases/StartCooking';
import { CompleteItem } from '../../demos/sims/v2/L1_Atomic/usecases/CompleteItem';
import { GetTicket } from '../../demos/sims/v2/L1_Atomic/usecases/GetTicket';
import { KitchenPolicy } from '../../demos/sims/v2/L1_Atomic/domain/KitchenPolicy';

export class HarnessFactory {
    static createL1(seed: number = 1): SimulationWorld {
        const clock = new SimulatedClock();
        const random = new SimulatedRandom(seed);
        const eventBus = new InMemoryEventBus();
        const world = new SimulationWorldImpl(clock, random, eventBus);

        const repo = new InMemoryRepository();
        const uow = new UnitOfWorkFactory();
        const policy = new KitchenPolicy();

        world.registerUseCase('PlaceOrder', new PlaceOrder(repo, uow));
        world.registerUseCase('StartCooking', new StartCooking(repo, policy, uow));
        world.registerUseCase('CompleteItem', new CompleteItem(repo, policy, uow));
        world.registerUseCase('GetTicket', new GetTicket(repo));

        return world;
    }
}
