import { SimulationWorldImpl } from '../SimulationWorldImpl';
import { SimulatedClock, SimulatedRandom, InMemoryEventBus, SimulatedIdGenerator } from '../../../core';

describe('SimulationWorldImpl', () => {
    let world: SimulationWorldImpl;

    beforeEach(() => {
        world = new SimulationWorldImpl(
            new SimulatedClock(),
            new SimulatedRandom(123),
            new InMemoryEventBus(),
            new SimulatedIdGenerator()
        );
    });

    it('should throw if UseCase is not found on dispatch', async () => {
        await expect(world.dispatch('user', 'UnknownIntent', {}))
            .rejects.toThrow('UseCase not found: UnknownIntent');
    });

    it('should throw if Query is not found', async () => {
        await expect(world.query('UnknownQuery', {}))
            .rejects.toThrow('Query not found: UnknownQuery');
    });

    it('should settle by advancing clock', async () => {
        const spy = jest.spyOn(world.clock, 'advance');
        await world.settle();
        expect(spy).toHaveBeenCalledWith(0);
    });
});
