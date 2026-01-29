import { Hexagon } from '../../src/system/Hexagon';
import { PlaceOrder } from './PlaceOrder';
import { PlaceOrderPolicy } from './PlaceOrderPolicy';
import { PlaceOrderController } from './PlaceOrderController';
import { OrderRepository } from './OrderRepository';

/**
 * The "Manifest" for the Place Order vertical slice.
 * 
 * This file is the "Index" of the feature.
 * It proves that all parts exist and fit into the Hexagon.
 */
export const PlaceOrderHex = Hexagon.define({
    name: 'Place Order Feature',
    primaryAdapter: PlaceOrderController,
    application: PlaceOrder,
    ports: PlaceOrderPolicy, // Policies kind of fit here? Or Secondary?
    secondaryAdapters: [OrderRepository]
});

