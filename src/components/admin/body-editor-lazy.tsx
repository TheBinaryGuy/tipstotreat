import { ClientOnly } from '@tanstack/react-router';
import { Suspense, lazy, type ComponentProps } from 'react';

import type { BodyEditor as Editor } from './body-editor';

type Props = ComponentProps<typeof Editor>;

/**
 * The Tiptap editor only ever runs in the browser, so it is kept out of the Worker bundle: on the
 * server this branch folds to `null` and the dynamic import is dropped, which keeps the deploy
 * under Cloudflare's size limit.
 */
const LazyEditor = import.meta.env.SSR
    ? null
    : lazy(() => import('./body-editor').then(m => ({ default: m.BodyEditor })));

function Placeholder() {
    return <div aria-hidden className='bg-muted/30 min-h-72 animate-pulse rounded-md border' />;
}

export function BodyEditor(props: Props) {
    if (!LazyEditor) return <Placeholder />;
    return (
        <ClientOnly fallback={<Placeholder />}>
            <Suspense fallback={<Placeholder />}>
                <LazyEditor {...props} />
            </Suspense>
        </ClientOnly>
    );
}
