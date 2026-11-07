// Flying S Company — native store pickup configuration for checkout.
// The checkout never hardcodes pickup settings. Product Hub
// (Administration → Store Locations & Pickup) is the master and publishes the
// customer-facing pickup configuration at PICKUP_CONFIG_URL (only values it has
// verified in BigCommerce). If the configuration cannot be loaded, pickup is
// simply not offered and shipping works exactly as before.
export const PICKUP_CONFIG_URL =
    'https://flyings-product-hub.base44.app/functions/pickupCheckoutConfig';

const TIMEOUT_MS = 6000;

export interface PickupAddress {
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface PickupConfig {
    pickupMethodId: number;
    displayName: string;
    instructions: string;
    preparationTime: string;
    locationName: string;
    phone: string;
    address: PickupAddress;
    version: string;
}

interface FetchResponse {
    ok: boolean;
    json(): Promise<unknown>;
}

export type PickupFetch = (url: string, init?: RequestInit) => Promise<FetchResponse>;

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export function parsePickupConfig(raw: unknown): PickupConfig | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const data = raw as Record<string, unknown>;
    const address = (
        data.address && typeof data.address === 'object' ? data.address : {}
    ) as Record<string, unknown>;
    const pickupMethodId = Number(data.pickup_method_id);

    if (
        data.enabled !== true ||
        !Number.isInteger(pickupMethodId) ||
        pickupMethodId <= 0 ||
        !text(address.address1) ||
        !text(address.city)
    ) {
        return null;
    }

    return {
        pickupMethodId,
        displayName: text(data.display_name) || 'Pick up in store',
        instructions: text(data.collection_instructions),
        preparationTime: text(data.collection_time_description),
        locationName: text(data.location_name),
        phone: text(data.phone),
        address: {
            address1: text(address.address1),
            address2: text(address.address2),
            city: text(address.city),
            state: text(address.state),
            postalCode: text(address.postal_code),
            country: text(address.country),
        },
        version: text(data.version),
    };
}

let loaded: PickupConfig | null = null;
let pending: Promise<PickupConfig | null> | undefined;

export function getLoadedPickupConfig(): PickupConfig | null {
    return loaded;
}

export function loadPickupConfig(
    fetchFn: PickupFetch = (url, init) => fetch(url, init),
    url: string = PICKUP_CONFIG_URL,
): Promise<PickupConfig | null> {
    if (pending) {
        return pending;
    }

    const request = (async () => {
        const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();
        const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : undefined;

        try {
            const response = await fetchFn(url, { credentials: 'omit', signal: controller?.signal });

            return response.ok ? parsePickupConfig(await response.json()) : null;
        } catch {
            return null;
        } finally {
            if (timer) {
                clearTimeout(timer);
            }
        }
    })();

    pending = request.then((config) => {
        loaded = config;

        if (!config) {
            pending = undefined;
        }

        return config;
    });

    return pending;
}

export function resetPickupConfig(): void {
    loaded = null;
    pending = undefined;
}
