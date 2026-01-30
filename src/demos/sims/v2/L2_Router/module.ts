import { HexagonSpec } from '../../../../core';
import { PlaceOrderL2 } from './usecases/PlaceOrderL2';
import { GetStationItems } from './usecases/GetStationItems';
import { KitchenStationProjector } from './usecases/KitchenStationProjector';

export const KitchenRouterHexagon: HexagonSpec = {
    name: 'Kitchen_L2',
    version: '1.0.0',
    description: 'Kitchen Fan-Out Demo (L2)',
    primaryAdapters: [],
    useCases: [
        PlaceOrderL2 as any,
        GetStationItems as any
    ],
    policies: [],
    secondaryPorts: [],
    secondaryAdapters: [
        KitchenStationProjector as any
    ]
};
