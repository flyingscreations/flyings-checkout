import { useEffect, useState } from 'react';

import { getLoadedPickupConfig, loadPickupConfig, type PickupConfig } from './pickupConfig';

export default function usePickupConfig(): { config: PickupConfig | null; isLoading: boolean } {
    const [state, setState] = useState(() => {
        const config = getLoadedPickupConfig();

        return { config, isLoading: !config };
    });

    useEffect(() => {
        let isActive = true;

        void loadPickupConfig().then((config) => {
            if (isActive) {
                setState({ config, isLoading: false });
            }
        });

        return () => {
            isActive = false;
        };
    }, []);

    return state;
}
