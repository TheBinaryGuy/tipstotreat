import { useEffect } from 'react';

/** Registers the service worker in production builds only. */
export function PwaRegister() {
    useEffect(() => {
        if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
            /* offline support is optional */
        });
    }, []);
    return null;
}
