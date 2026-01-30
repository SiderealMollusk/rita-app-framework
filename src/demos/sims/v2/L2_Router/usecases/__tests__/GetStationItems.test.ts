import { GetStationItems } from '../GetStationItems';
import { StationItem } from '../../domain/StationItem';
import { InMemoryRepository, ContextFactory } from '../../../../../../core';

describe('GetStationItems', () => {
    let useCase: GetStationItems;
    let grillRepo: InMemoryRepository<StationItem>;
    let stations: Map<string, InMemoryRepository<StationItem>>;

    beforeEach(() => {
        grillRepo = new InMemoryRepository<StationItem>();
        stations = new Map([
            ['Grill', grillRepo]
        ]);
        useCase = new GetStationItems(stations);
    });

    it('should return items for a given station', async () => {
        const ctx = ContextFactory.createSystem();
        await grillRepo.save(ctx as any, StationItem.create('si-1', 'ticket-1', 'Burger', 'Grill'));

        const items = await useCase.run({ station: 'Grill' });
        expect(items).toEqual(['Burger']);
    });

    it('should return empty array if station does not exist', async () => {
        const items = await useCase.run({ station: 'Unknown' });
        expect(items).toEqual([]);
    });
});
