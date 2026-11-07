import { type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import usePickupConfig from './usePickupConfig';
import './pickup.scss';

// Collapsed shipping-step summary for a pickup order. The address shown is
// the pickup location BigCommerce attached to the pickup consignment.
const StaticPickupConsignment: FunctionComponent<{ consignment: Consignment }> = ({
    consignment,
}) => {
    const { config } = usePickupConfig();
    const address = consignment.shippingAddress;

    return (
        <div className="staticConsignment staticConsignment--pickup" data-test="static-pickup-consignment">
            <p className="pickupLocation-name">
                {config ? config.displayName : 'Pick up in store'}
            </p>
            {address && (
                <address className="pickupLocation-address">
                    {address.address1}
                    {address.address2 ? ', ' + address.address2 : ''}
                    <br />
                    {address.city}, {address.stateOrProvinceCode} {address.postalCode}
                </address>
            )}
            <p className="pickupLocation-notShipped">This order will not be shipped.</p>
        </div>
    );
};

export default StaticPickupConsignment;
