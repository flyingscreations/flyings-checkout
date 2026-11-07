import { type Consignment } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

import isPickupConsignment from './pickup/isPickupConsignment';

export default function isSelectedShippingOptionValid(consignments: Consignment[]): boolean {
    if (!consignments.length) {
        return false;
    }

    return every(consignments, (consignment) => {
        // Flying S: a native pickup consignment needs no shipping method.
        if (isPickupConsignment(consignment)) {
            return true;
        }

        if (consignment.selectedShippingOption?.type === 'custom') {
            return true;
        }

        return (
            consignment.availableShippingOptions &&
            consignment.availableShippingOptions.find(
                ({ id }) => id === consignment.selectedShippingOption?.id,
            )
        );
    });
}
