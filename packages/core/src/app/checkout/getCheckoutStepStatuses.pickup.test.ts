import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';

import { getCart } from '../cart/carts.mock';
import { getConsignment } from '../shipping/consignment.mock';
import hasSelectedShippingOptions from '../shipping/hasSelectedShippingOptions';
import isSelectedShippingOptionValid from '../shipping/isSelectedShippingOptionValid';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import CheckoutStepType from './CheckoutStepType';
import getCheckoutStepStatuses from './getCheckoutStepStatuses';

// BigCommerce attaches the pickup location (no customer name) as the address
// of a native pickup consignment.
const pickupLocationAddress = () => ({
    ...getShippingAddress(),
    firstName: '',
    lastName: '',
    address1: '501 N 1st St',
    city: 'Madill',
    stateOrProvinceCode: 'OK',
    postalCode: '73446',
});

const pickupConsignment = () => ({
    ...getConsignment(),
    selectedShippingOption: undefined,
    selectedPickupOption: { pickupMethodId: 1 },
    shippingAddress: pickupLocationAddress(),
    address: pickupLocationAddress(),
});

describe('checkout steps with native store pickup', () => {
    let service: CheckoutService;
    let state: CheckoutSelectors;

    beforeEach(() => {
        service = createCheckoutService();
        state = service.getState();
        jest.spyOn(state.data, 'getCart').mockReturnValue(getCart());
    });

    it('completes the shipping step with a pickup consignment and no shipping method', () => {
        jest.spyOn(state.data, 'getShippingAddress').mockReturnValue(pickupLocationAddress());
        jest.spyOn(state.data, 'getConsignments').mockReturnValue([pickupConsignment()]);

        const shipping = find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Shipping });

        expect(shipping?.isComplete).toBe(true);
        expect(shipping?.isRequired).toBe(true);
    });

    it('still requires every item to be assigned', () => {
        jest.spyOn(state.data, 'getShippingAddress').mockReturnValue(pickupLocationAddress());
        jest.spyOn(state.data, 'getConsignments').mockReturnValue([{ ...pickupConsignment(), lineItemIds: [] }]);

        expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Shipping })?.isComplete).toBe(false);
    });

    it('keeps shipping unchanged: a shipping consignment still needs an address and a method', () => {
        jest.spyOn(state.data, 'getShippingAddress').mockReturnValue(getShippingAddress());
        jest.spyOn(state.data, 'getConsignments').mockReturnValue([{ ...getConsignment(), selectedShippingOption: undefined }]);

        expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Shipping })?.isComplete).toBe(false);
        expect(hasSelectedShippingOptions([{ ...getConsignment(), selectedShippingOption: undefined }])).toBe(false);
    });

    it('treats a pickup consignment as a valid selection', () => {
        expect(hasSelectedShippingOptions([pickupConsignment()])).toBe(true);
        expect(isSelectedShippingOptionValid([pickupConsignment()])).toBe(true);
    });
});
