import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { Alert, AlertType, Button, ButtonVariant } from '@bigcommerce/checkout/ui';

import { type PickupConfig } from './pickupConfig';
import PickupLocationDetails from './PickupLocationDetails';
import { isPickupUnavailableError, planPickupConsignment } from './pickupRequest';

export interface PickupPanelProps {
    cart: Cart;
    config: PickupConfig;
    consignments: Consignment[];
    customerMessage: string;
    onContinue(): void;
    onUnhandledError(error: Error): void;
}

// Pickup replaces the shipping address and shipping method. It creates
// BigCommerce's real native pickup consignment — never a $0 shipping option.
const PickupPanel: FunctionComponent<PickupPanelProps> = ({
    cart,
    config,
    consignments,
    customerMessage,
    onContinue,
    onUnhandledError,
}) => {
    const { checkoutService } = useCheckout();
    const [comment, setComment] = useState(customerMessage || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUnavailable, setIsUnavailable] = useState(false);

    const handleContinue = async () => {
        setIsSaving(true);
        setIsUnavailable(false);

        try {
            const plan = planPickupConsignment(cart, consignments, config.pickupMethodId);

            if (plan.update) {
                await checkoutService.updateConsignment(plan.update);
            } else {
                for (const id of plan.deleteIds) {
                    // eslint-disable-next-line no-await-in-loop
                    await checkoutService.deleteConsignment(id);
                }

                if (plan.create) {
                    await checkoutService.createConsignments(plan.create);
                }
            }

            if (comment !== (customerMessage || '')) {
                await checkoutService.updateCheckout({ customerMessage: comment });
            }

            onContinue();
        } catch (error) {
            if (isPickupUnavailableError(error)) {
                setIsUnavailable(true);
            } else if (error instanceof Error) {
                onUnhandledError(error);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="checkout-form pickupPanel" id="checkout-pickup">
            <PickupLocationDetails config={config} />

            {isUnavailable && (
                <Alert type={AlertType.Error}>
                    Pickup is not available for every item in your cart. Please choose Ship to
                    address.
                </Alert>
            )}

            <fieldset className="form-fieldset">
                <div className="form-field">
                    <label
                        className="form-label optimizedCheckout-form-label"
                        htmlFor="pickupOrderComment"
                    >
                        Order comments
                    </label>
                    <input
                        className="form-input optimizedCheckout-form-input"
                        id="pickupOrderComment"
                        maxLength={2000}
                        name="pickupOrderComment"
                        onChange={(event) => setComment(event.target.value)}
                        type="text"
                        value={comment}
                    />
                </div>
            </fieldset>

            <div className="form-actions">
                <Button
                    className="body-bold"
                    disabled={isSaving}
                    id="checkout-pickup-continue"
                    isLoading={isSaving}
                    onClick={() => {
                        void handleContinue();
                    }}
                    type="button"
                    variant={ButtonVariant.Primary}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default PickupPanel;
