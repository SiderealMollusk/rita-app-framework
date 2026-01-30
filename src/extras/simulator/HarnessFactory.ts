import { SimulationWorld } from './SimulatorSkeleton';
import { SimulationWorldImpl } from './SimulationWorldImpl';
import {
    SimulatedClock,
    SimulatedRandom,
    InMemoryEventBus,
    UnitOfWorkFactory,
    InMemoryRepository,
    SimulatedIdGenerator
} from '../../core';

import { PlaceOrder } from '../../demos/sims/v2/L1_Atomic/usecases/PlaceOrder';
import { StartCooking } from '../../demos/sims/v2/L1_Atomic/usecases/StartCooking';
import { CompleteItem } from '../../demos/sims/v2/L1_Atomic/usecases/CompleteItem';
import { GetTicket } from '../../demos/sims/v2/L1_Atomic/usecases/GetTicket';
import { KitchenPolicy } from '../../demos/sims/v2/L1_Atomic/domain/KitchenPolicy';

import { PlaceOrderL2 } from '../../demos/sims/v2/L2_Router/usecases/PlaceOrderL2';
import { GetStationItems } from '../../demos/sims/v2/L2_Router/usecases/GetStationItems';
import { KitchenStationProjector } from '../../demos/sims/v2/L2_Router/usecases/KitchenStationProjector';
import { StationItem } from '../../demos/sims/v2/L2_Router/domain/StationItem';

import { StartCookingL3 } from '../../demos/sims/v2/L3_Duration/usecases/StartCookingL3';

import { FinishItem } from '../../demos/sims/v2/L4_Expo/usecases/FinishItem';
import { CloseTicket } from '../../demos/sims/v2/L4_Expo/usecases/CloseTicket';
import { GetTicketStatus } from '../../demos/sims/v2/L4_Expo/usecases/GetTicketStatus';
import { FinishItemPolicy } from '../../demos/sims/v2/L4_Expo/domain/FinishItemPolicy';
import { TicketClosingPolicy } from '../../demos/sims/v2/L4_Expo/domain/TicketClosingPolicy';

import { StartCourse } from '../../demos/sims/v2/L5_Pacing/usecases/StartCourse';
import { KitchenWorkflowManager } from '../../demos/sims/v2/L5_Pacing/usecases/KitchenWorkflowManager';

export class HarnessFactory {
    static createL1(seed: number = 1): SimulationWorld {
        const clock = new SimulatedClock();
        const random = new SimulatedRandom(seed);
        const eventBus = new InMemoryEventBus();
        const idGen = new SimulatedIdGenerator();
        const world = new SimulationWorldImpl(clock, random, eventBus, idGen);

        const repo = new InMemoryRepository();
        const uow = new UnitOfWorkFactory();
        const policy = new KitchenPolicy();

        world.registerUseCase('PlaceOrder', new PlaceOrder(repo, uow, idGen));
        world.registerUseCase('StartCooking', new StartCooking(repo, policy, uow));
        world.registerUseCase('CompleteItem', new CompleteItem(repo, policy, uow));
        world.registerUseCase('GetTicket', new GetTicket(repo));

        return world;
    }

    static createL2(seed: number = 1): SimulationWorld {
        const clock = new SimulatedClock();
        const random = new SimulatedRandom(seed);
        const eventBus = new InMemoryEventBus();
        const idGen = new SimulatedIdGenerator();
        const world = new SimulationWorldImpl(clock, random, eventBus, idGen);

        const primaryRepo = new InMemoryRepository();
        const grillRepo = new InMemoryRepository<StationItem>();
        const fryerRepo = new InMemoryRepository<StationItem>();
        const barRepo = new InMemoryRepository<StationItem>();

        const stations = new Map<string, any>([
            ['Grill', grillRepo],
            ['Fryer', fryerRepo],
            ['Bar', barRepo]
        ]);

        const uow = new UnitOfWorkFactory(eventBus);

        const projector = new KitchenStationProjector(stations, idGen);
        eventBus.subscribe('TicketCreated', (ctx, event) => projector.execute(ctx, event as any));

        world.registerUseCase('PlaceOrder', new PlaceOrderL2(primaryRepo, uow, idGen, eventBus));
        world.registerUseCase('StationView', new GetStationItems(stations));

        return world;
    }

    static createL3(seed: number = 1): SimulationWorld {
        const clock = new SimulatedClock();
        const random = new SimulatedRandom(seed);
        const eventBus = new InMemoryEventBus();
        const idGen = new SimulatedIdGenerator();
        const world = new SimulationWorldImpl(clock, random, eventBus, idGen);

        const repo = new InMemoryRepository();
        const uow = new UnitOfWorkFactory(eventBus);
        const policy = new KitchenPolicy();

        const completeItem = new CompleteItem(repo, policy, uow);
        const startCooking = new StartCookingL3(repo, policy, uow, clock, completeItem);

        world.registerUseCase('PlaceOrder', new PlaceOrder(repo, uow, idGen));
        world.registerUseCase('StartCooking', startCooking);
        world.registerUseCase('GetTicket', new GetTicket(repo));

        return world;
    }

    static createL4(seed: number = 1): SimulationWorld {
        const clock = new SimulatedClock();
        const random = new SimulatedRandom(seed);
        const eventBus = new InMemoryEventBus();
        const idGen = new SimulatedIdGenerator();
        const world = new SimulationWorldImpl(clock, random, eventBus, idGen);

        const repo = new InMemoryRepository();
        const uow = new UnitOfWorkFactory(eventBus);
        const finishPolicy = new FinishItemPolicy();
        const closePolicy = new TicketClosingPolicy();

        world.registerUseCase('PlaceOrder', new PlaceOrderL2(repo, uow, idGen, eventBus));
        world.registerUseCase('FinishItem', new FinishItem(repo, finishPolicy, uow));
        world.registerUseCase('CloseTicket', new CloseTicket(repo, closePolicy, uow));
        world.registerUseCase('GetTicketStatus', new GetTicketStatus(repo));

        return world;
    }

    static createL5(seed: number = 1): SimulationWorld {
        const clock = new SimulatedClock();
        const random = new SimulatedRandom(seed);
        const eventBus = new InMemoryEventBus();
        const idGen = new SimulatedIdGenerator();
        const world = new SimulationWorldImpl(clock, random, eventBus, idGen);

        const repo = new InMemoryRepository();
        const uow = new UnitOfWorkFactory(eventBus);
        const policy = new KitchenPolicy();

        const startCourse = new StartCourse(repo, policy, uow);
        const workflow = new KitchenWorkflowManager(repo, startCourse);

        eventBus.subscribe('ItemCompleted', (ctx, event) => workflow.execute(ctx, event));

        world.registerUseCase('PlaceOrder', new PlaceOrderL2(repo, uow, idGen, eventBus));
        world.registerUseCase('StartCourse', startCourse);
        world.registerUseCase('FinishItem', new CompleteItem(repo, policy, uow, eventBus));
        world.registerUseCase('GetTicket', new GetTicket(repo));

        return world;
    }
}
