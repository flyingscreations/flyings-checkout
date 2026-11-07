import {
    type Cart,
    type Consignment,
    type ConsignmentCreateRequestBody,
    type ConsignmentLineItem,
} from '@bigcommerce/checkout-sdk';

export interface PickupConsignmentPlan {
    deleteIds: string[];
    update?: {
        id: string;
        lineItems: ConsignmentLineItem[];
        pickupOption: { pickupMethodId: number };
    };
    create?: ConsignmentCreateRequestBody[];
}

// The same items the SDK assigns for single-address shipping.
export function getPickupLineItems(cart: Cart): ConsignmentLineItem[] {
    const { physicalItems, customItems = [] } = cart.lineItems;

    return [...physicalItems, ...customItems].map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
    }));
}

// BigCommerce allows exactly one pickup consignment for the whole cart.
export function planPickupConsignment(
    cart: Cart,
    consignments: Consignment[],
    pickupMethodId: number,
): PickupConsignmentPlan {
    const lineItems = getPickupLineItems(cart);
    const pickupOption = { pickupMethodId };

    if (consignments.length === 1) {
        return { deleteIds: [], update: { id: consignments[0].id, lineItems, pickupOption } };
    }

    return {
        deleteIds: consignments.map(({ id }) => id),
        create: [{ lineItems, pickupOption }],
    };
}

// BigCommerce answers 422 when an item in the cart cannot be picked up.
export function isPickupUnavailableError(error: unknown): boolean {
    const status = (error as { status?: unknown } | null)?.status;

    return status === 422 || status === 400;
}
