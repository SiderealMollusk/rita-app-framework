import { HexagonSpec } from '../../../../core';
import { PlaceOrder } from './usecases/PlaceOrder';
import { StartCooking } from './usecases/StartCooking';
import { CompleteItem } from './usecases/CompleteItem';
import { GetTicket } from './usecases/GetTicket';
import { KitchenPolicy } from './domain/KitchenPolicy';

export const KitchenHexagon: HexagonSpec = {
    name: 'Kitchen_L1',
    version: '1.0.0',
    description: 'Atomic Kitchen Demo (L1)',
    primaryAdapters: [],
    useCases: [
        PlaceOrder as any,
        StartCooking as any,
        CompleteItem as any,
        GetTicket as any
    ],
    policies: [KitchenPolicy],
    secondaryPorts: [],
    secondaryAdapters: []
};
