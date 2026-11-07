import classNames from 'classnames';
import React, { type FunctionComponent } from 'react';

import './pickup.scss';

export type FulfillmentMode = 'ship' | 'pickup';

export interface FulfillmentChoiceProps {
    mode: FulfillmentMode;
    pickupLabel: string;
    isDisabled?: boolean;
    onChange(mode: FulfillmentMode): void;
}

const CHOICES: Array<{ value: FulfillmentMode; label: string }> = [
    { value: 'ship', label: 'Ship to address' },
    { value: 'pickup', label: 'Pick up in store' },
];

const FulfillmentChoice: FunctionComponent<FulfillmentChoiceProps> = ({
    mode,
    pickupLabel,
    isDisabled,
    onChange,
}) => (
    <fieldset className="form-fieldset fulfillmentChoice" id="checkout-fulfillment-choice">
        <legend className="form-legend optimizedCheckout-headingSecondary">
            How would you like to receive your order?
        </legend>
        <ul className="form-checklist optimizedCheckout-form-checklist">
            {CHOICES.map(({ value, label }) => (
                <li
                    className={classNames(
                        'form-checklist-item',
                        'optimizedCheckout-form-checklist-item',
                        {
                            'form-checklist-item--selected': mode === value,
                            'optimizedCheckout-form-checklist-item--selected': mode === value,
                        },
                    )}
                    key={value}
                >
                    <div className="form-checklist-header">
                        <div className="form-field">
                            <input
                                checked={mode === value}
                                className="form-checklist-checkbox optimizedCheckout-form-checklist-checkbox"
                                disabled={isDisabled}
                                id={'fulfillment-' + value}
                                name="fulfillmentMode"
                                onChange={() => onChange(value)}
                                type="radio"
                                value={value}
                            />
                            <label
                                className="form-label optimizedCheckout-form-label"
                                htmlFor={'fulfillment-' + value}
                            >
                                <span className="fulfillmentChoice-label">{label}</span>
                                {value === 'pickup' && pickupLabel && (
                                    <span className="fulfillmentChoice-detail">{pickupLabel}</span>
                                )}
                            </label>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    </fieldset>
);

export default FulfillmentChoice;
