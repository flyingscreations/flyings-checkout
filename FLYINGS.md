# Flying S Company custom checkout

Fork of BigCommerce's official checkout (bigcommerce/checkout-js, Optimized
One-Page Checkout) with one addition: a **Ship to address / Pick up in store**
choice that uses BigCommerce's native pickup method and pickup consignment.

* Baseline: branch flyings/upstream-baseline = upstream commit 77b8cc3 (v1.932.4).
* Work branch: flyings/native-pickup. Every push is tested and built by
  .github/workflows/flyings-checkout.yml and staged (never deployed) on the
  gh-pages branch at builds/<commit>/, served by GitHub Pages.
* Pickup settings are never hardcoded. The checkout reads the configuration
  Product Hub publishes (pickupCheckoutConfig). If it cannot be loaded, pickup
  is not offered and checkout behaves exactly like upstream.
* Payments, discounts, gift certificates, store credit, customer groups and
  address books are untouched upstream code.

## Changed upstream files
* packages/core/src/app/shipping/Shipping.tsx: fulfillment choice + pickup panel
* packages/core/src/app/shipping/hasSelectedShippingOptions.ts, isSelectedShippingOptionValid.ts: a pickup consignment counts as selected
* packages/core/src/app/checkout/getCheckoutStepStatuses.ts: pickup needs no customer shipping address
* packages/core/src/app/shipping/StaticConsignment.tsx: pickup summary
* packages/core/src/app/shipping/shippingOption/ShippingOptionsForm.tsx: no auto-selected shipping method on a pickup consignment; legacy "Pick up in Store" hidden while native pickup is offered
* New: packages/core/src/app/shipping/pickup/

## Going live and rolling back
Only an administrator, in Product Hub (Store Locations & Pickup).
Rollback = clear the custom checkout script URL in BigCommerce. The store
returns to BigCommerce's own Optimized One-Page Checkout, the configuration in
use before this project.

## Maintenance
Merge upstream releases into flyings/native-pickup regularly (payment provider
fixes ship in upstream checkout-js) and re-run the workflow.
