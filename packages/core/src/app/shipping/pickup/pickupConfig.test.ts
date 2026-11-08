import {
    getLoadedPickupConfig,
    getPickupPreviewToken,
    loadPickupConfig,
    parsePickupConfig,
    resetPickupConfig,
} from './pickupConfig';

const PUBLISHED = {
    enabled: true,
    pickup_method_id: 1,
    display_name: 'Local Pickup — In Person Only',
    collection_instructions: 'Come see us at our new location!',
    collection_time_description: 'Ready-to-ship items are ready same or next business day.',
    location_name: 'SHOWROOM',
    phone: '580-564-5751',
    address: { address1: '501 N 1st St', address2: '', city: 'Madill', state: 'OK', postal_code: '73446', country: 'US' },
    version: 'v1',
};

const ok = (body: unknown) => () => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

describe('pickup configuration published by Product Hub', () => {
    beforeEach(() => resetPickupConfig());

    it('reads the published pickup method, location and customer text', () => {
        expect(parsePickupConfig(PUBLISHED)).toEqual(
            expect.objectContaining({
                pickupMethodId: 1,
                displayName: 'Local Pickup — In Person Only',
                instructions: 'Come see us at our new location!',
                address: expect.objectContaining({ city: 'Madill', postalCode: '73446' }),
            }),
        );
    });

    it('offers no pickup when Product Hub has pickup turned off or unpublished', () => {
        expect(parsePickupConfig({ ...PUBLISHED, enabled: false })).toBeNull();
        expect(parsePickupConfig({ ...PUBLISHED, pickup_method_id: 0 })).toBeNull();
        expect(parsePickupConfig({ ...PUBLISHED, address: {} })).toBeNull();
        expect(parsePickupConfig('nope')).toBeNull();
    });

    it('reads only a signed preview token, never a bare flag', () => {
        expect(getPickupPreviewToken('?pickup_preview=abcdefghijklmnopqrstuvwxyz.sig_123')).toBe('abcdefghijklmnopqrstuvwxyz.sig_123');
        expect(getPickupPreviewToken('?pickup_preview=1')).toBe('');
        expect(getPickupPreviewToken('')).toBe('');
    });

    it('loads once and caches a published configuration', async () => {
        const fetchFn = jest.fn(ok(PUBLISHED));

        await loadPickupConfig(fetchFn);
        await loadPickupConfig(fetchFn);

        expect(fetchFn).toHaveBeenCalledTimes(1);
        expect(getLoadedPickupConfig()?.pickupMethodId).toBe(1);
    });

    it('falls back to shipping only when the configuration cannot be loaded', async () => {
        const failing = jest.fn(() => Promise.reject(new Error('offline')));

        await expect(loadPickupConfig(failing)).resolves.toBeNull();
        expect(getLoadedPickupConfig()).toBeNull();

        await loadPickupConfig(jest.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) })));
        expect(getLoadedPickupConfig()).toBeNull();
    });
});
