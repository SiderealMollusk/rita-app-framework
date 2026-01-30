import { QueryUseCase, BaseCtx, ContextFactory } from '../../../../../core';

export interface GetStationItemsInput {
    station: string;
}

export class GetStationItems extends QueryUseCase<GetStationItemsInput, string[]> {
    constructor(private stations: Map<string, any>) {
        super();
    }

    public async run(input: GetStationItemsInput): Promise<string[]> {
        const repo = this.stations.get(input.station);
        if (!repo) return [];

        const ctx = ContextFactory.createSystem();
        const items = await repo.findAll(ctx);
        return items.map((it: any) => it._data.itemName);
    }
}
