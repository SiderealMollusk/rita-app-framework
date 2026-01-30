import { KitchenStationProjector } from '../KitchenStationProjector';
import { StationItem } from '../../domain/StationItem';
import { InMemoryRepository, SimulatedIdGenerator, ContextFactory, RitaClock } from '../../../../../../core';

describe('KitchenStationProjector', () => {
    let projector: KitchenStationProjector;
    let stations: Map<string, InMemoryRepository<StationItem>>;
    let idGen: SimulatedIdGenerator;

    beforeEach(() => {
        stations = new Map([
            ['Grill', new InMemoryRepository<StationItem>()],
            ['Fryer', new InMemoryRepository<StationItem>()],
            ['Bar', new InMemoryRepository<StationItem>()],
            ['Other', new InMemoryRepository<StationItem>()]
        ]);
        idGen = new SimulatedIdGenerator();
        projector = new KitchenStationProjector(stations, idGen);
    });

    it('should project items to correct station repositories', async () => {
        const ctx = ContextFactory.createSystem();
        await projector.execute(ctx, {
            name: 'TicketCreated',
            timestamp: RitaClock.now(),
            payload: {
                ticketId: 'ticket-1',
                items: ['Burger', 'Fries', 'Coke', 'Salad']
            }
        });

        const grillItems = await stations.get('Grill')!.findAll(ctx as any);
        expect(grillItems).toHaveLength(1);
        expect(grillItems[0]._data.itemName).toBe('Burger');

        const fryerItems = await stations.get('Fryer')!.findAll(ctx as any);
        expect(fryerItems).toHaveLength(1);
        expect(fryerItems[0]._data.itemName).toBe('Fries');

        const barItems = await stations.get('Bar')!.findAll(ctx as any);
        expect(barItems).toHaveLength(1);
        expect(barItems[0]._data.itemName).toBe('Coke');

        const otherItems = await stations.get('Other')!.findAll(ctx as any);
        expect(otherItems).toHaveLength(1);
        expect(otherItems[0]._data.itemName).toBe('Salad');
    });

    it('should do nothing if station repository is not found', async () => {
        const ctx = ContextFactory.createSystem();
        const smallStations = new Map();
        const smallProjector = new KitchenStationProjector(smallStations, idGen);

        await expect(smallProjector.execute(ctx, {
            name: 'TicketCreated',
            timestamp: RitaClock.now(),
            payload: {
                ticketId: 'ticket-1',
                items: ['Burger']
            }
        })).resolves.not.toThrow();
    });
});
