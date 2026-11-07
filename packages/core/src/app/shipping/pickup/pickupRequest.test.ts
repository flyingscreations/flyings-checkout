import { getCart } from '../../cart/carts.mock';
import { getConsignment } from '../consignment.mock';

import isPickupConsignment, { isPickupCheckout } from './isPickupConsignment';
import { getPickupLineItems, isPickupUnavailableError, planPickupConsignment } from './pickupRequest';
import { LEGACY_PICKUP_TYPE, withoutLegacyPickup } from './pickupShippingOptions';

const pickupConsignment = () => ({
    ...getConsignment(),
    selectedShippingOption: undefined,
    selectedPickupOption: { pickupMethodId: 1 },
});

describe('native pickup consignment requests', () => {
    it('assigns every physical and custom item to the pickup consignment', () => {
        const cart = getCart();

        expect(getPickupLineItems(cart)).toEqual(
            [...cart.lineItems.physicalItems, ...(cart.lineItems.customItems || [])].map((item) => ({
                itemId: item.id,
                quantity: item.quantity,
            })),
        );
    });

    it('switches the existing consignment to pickup method 1', () => {
        const plan = planPickupConsignment(getCart(), [getConsignment()], 1);

        expect(plan.deleteIds).toEqual([]);
        expect(plan.update).toEqual(
            expect.objectContaining({ id: getConsignment().id, pickupOption: { pickupMethodId: 1 } }),
        );
        expect(plan.update).not.toHaveProperty('shippingOptionId');
        expect(plan.update).not.toHaveProperty('address');
    });

    it('creates one pickup consignment when there is none (or replaces several)', () => {
        expect(planPickupConsignment(getCart(), [], 1)).toEqual(
            expect.objectContaining({
                deleteIds: [],
                create: [expect.objectContaining({ pickupOption: { pickupMethodId: 1 } })],
            }),
        );

        const several = planPickupConsignment(getCart(), [getConsignment(), { ...getConsignment(), id: 'b' }], 1);

        expect(several.deleteIds).toEqual([getConsignment().id, 'b']);
        expect(several.create).toHaveLength(1);
    });

    it('recognizes pickup consignments and pickup-only checkouts', () => {
        expect(isPickupConsignment(pickupConsignment())).toBe(true);
        expect(isPickupConsignment(getConsignment())).toBe(false);
        expect(isPickupCheckout([pickupConsignment()])).toBe(true);
        expect(isPickupCheckout([pickupConsignment(), getConsignment()])).toBe(false);
        expect(isPickupCheckout([])).toBe(false);
    });

    it('treats a BigCommerce 422 as "pickup not available for this cart"', () => {
        expect(isPickupUnavailableError({ status: 422 })).toBe(true);
        expect(isPickupUnavailableError(new Error('network'))).toBe(false);
    });

    it('hides the legacy "Pick up in Store" shipping method only while native pickup is offered', () => {
        const base = getConsignment().availableShippingOptions || [];
        const ship = { ...base[0], type: 'shipping_carrier_721' };
        const legacy = { ...ship, id: 'legacy', type: LEGACY_PICKUP_TYPE };

        expect(withoutLegacyPickup([ship, legacy], true)).toEqual([ship]);
        expect(withoutLegacyPickup([ship, legacy], false)).toEqual([ship, legacy]);
    });
});
