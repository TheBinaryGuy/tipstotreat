import { useEffect } from 'react';

/** Registers the service worker (production only) and stops iOS Safari's focus auto-zoom. */
export function PwaRegister() {
    useEffect(() => {
        // iOS zooms the page when a focused control's text is under 16px. maximum-scale=1 turns
        // that off on iOS while pinch zoom keeps working there; Android would honour it as a real
        // zoom lock, so it is added only on iOS devices.
        const isIos =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const viewport = document.querySelector('meta[name="viewport"]');
        if (isIos && viewport && !viewport.getAttribute('content')?.includes('maximum-scale')) {
            viewport.setAttribute(
                'content',
                `${viewport.getAttribute('content')}, maximum-scale=1`
            );
        }

        if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
            /* offline support is optional */
        });
    }, []);
    return null;
}
