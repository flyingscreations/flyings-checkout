import { type Consignment } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

import isPickupConsignment from './pickup/isPickupConsignment';

export default function hasSelectedShippingOptions(consignments: Consignment[]): boolean {
    if (!consignments.length) {
        return false;
    }

    return every(
        consignments,
        (consignment) =>
            (consignment.selectedShippingOption && consignment.selectedShippingOption.id) ||
            consignment.selectedShippingOption?.type === 'custom' ||
            // Flying S: a native pickup consignment needs no shipping method.
            isPickupConsignment(consignment),
    );
}
