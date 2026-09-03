import { Button } from '@/components/ui/button';
import { Link, createFileRoute } from '@tanstack/react-router';
import { WifiOffIcon } from 'lucide-react';

export const Route = createFileRoute('/_site/offline')({
    head: () => ({ meta: [{ title: 'Offline · TipsToTreat' }, { name: 'robots', content: 'noindex' }] }),
    component: OfflinePage,
});

function OfflinePage() {
    return (
        <div className='mx-auto max-w-4xl px-5 pt-16 text-center'>
            <WifiOffIcon className='text-muted-foreground mx-auto size-8' />
            <h1 className='mt-4 text-2xl font-semibold tracking-tight'>You're offline</h1>
            <p className='text-muted-foreground mx-auto mt-2 max-w-md'>
                Pages you have opened before are still available. Reconnect to see everything else.
            </p>
            <Button className='mt-6' render={<Link to='/' />} variant='outline'>
                Try the front page
            </Button>
        </div>
    );
}
