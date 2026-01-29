import { Hexagon } from '../../src/system/Hexagon';
import { TagOrder } from './TagOrder';
import { PriorityPolicy } from './PriorityPolicy';
import { TagOrderController } from './TagOrderController';
import { OrderRepository } from './OrderRepository';
import { UserGateway } from './UserGateway';

/**
 * The "Manifest" for the VIP Tagging vertical slice.
 */
export const TagOrderHex = Hexagon.define({
    name: 'VIP Tagging Feature',
    primaryAdapter: TagOrderController,
    application: TagOrder, // The Use Case / Interaction

    ports: PriorityPolicy,
    secondaryAdapters: [OrderRepository, UserGateway]
});
