import { type Consignment } from '@bigcommerce/checkout-sdk';

// A consignment fulfilled by a BigCommerce native pickup method (not shipped).
export default function isPickupConsignment(consignment?: Consignment | null): boolean {
    return !!consignment?.selectedPickupOption?.pickupMethodId;
}

export function isPickupCheckout(consignments?: Consignment[] | null): boolean {
    return !!consignments && consignments.length > 0 && consignments.every(isPickupConsignment);
}
