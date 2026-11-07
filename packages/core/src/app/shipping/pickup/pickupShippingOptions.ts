import { type ShippingOption } from '@bigcommerce/checkout-sdk';

export const LEGACY_PICKUP_TYPE = 'shipping_pickupinstore';

// While native pickup is offered, the legacy "Pick up in Store" shipping
// method is hidden from the shipping list so customers see one pickup choice.
export function withoutLegacyPickup(
    options: ShippingOption[] | undefined,
    isNativePickupOffered: boolean,
): ShippingOption[] | undefined {
    if (!options || !isNativePickupOffered) {
        return options;
    }

    return options.filter(({ type }) => type !== LEGACY_PICKUP_TYPE);
}
