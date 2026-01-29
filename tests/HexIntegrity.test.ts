import { PlaceOrderHex } from '../../dev-demo/010_placeOrder/hex';
import { TagOrderHex } from '../../dev-demo/011_vip_tagging/hex';



describe('Hex Definitions (Manifest Integrity)', () => {

    it('PlaceOrderHex should be valid', () => {
        expect(PlaceOrderHex).toBeDefined();
        expect(PlaceOrderHex.name).toBe('Place Order Feature');
        expect(Object.isFrozen(PlaceOrderHex)).toBe(true);

        // Deep Validation (Manifest Truth)
        // Verify that the classes passed are indeed usable constructables
        expect(new PlaceOrderHex.primaryAdapter(new PlaceOrderHex.secondaryAdapters[0]())).toBeDefined();
    });

    it('TagOrderHex should be valid', () => {
        expect(TagOrderHex).toBeDefined();
        expect(TagOrderHex.name).toBe('VIP Tagging Feature');
        expect(Object.isFrozen(TagOrderHex)).toBe(true);

        expect(new TagOrderHex.primaryAdapter(
            new TagOrderHex.domain(new TagOrderHex.secondaryAdapters[0]())
        )).toBeDefined();
    });


});
