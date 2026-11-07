import React, { type FunctionComponent } from 'react';

import { type PickupConfig } from './pickupConfig';

const PickupLocationDetails: FunctionComponent<{ config: PickupConfig }> = ({ config }) => {
    const { address } = config;
    const region = [address.state, address.postalCode].filter(Boolean).join(' ');
    const cityLine = [address.city, region].filter(Boolean).join(', ');

    return (
        <div className="pickupLocation" data-test="pickup-location">
            <p className="pickupLocation-name optimizedCheckout-headingSecondary">
                {config.displayName}
            </p>
            {config.locationName && <p>{config.locationName}</p>}
            <address className="pickupLocation-address">
                {address.address1}
                <br />
                {address.address2 && (
                    <>
                        {address.address2}
                        <br />
                    </>
                )}
                {cityLine}
            </address>
            {config.phone && <p className="pickupLocation-detail">{config.phone}</p>}
            {config.preparationTime && (
                <p className="pickupLocation-detail">
                    <strong>Ready for pickup: </strong>
                    {config.preparationTime}
                </p>
            )}
            {config.instructions && (
                <p className="pickupLocation-detail">
                    <strong>Pickup instructions: </strong>
                    {config.instructions}
                </p>
            )}
            <p className="pickupLocation-notShipped" data-test="pickup-not-shipped">
                This order will not be shipped. You will pick it up at our store.
            </p>
        </div>
    );
};

export default PickupLocationDetails;
