import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getSessionServerFn } from '@/features/auth/server/auth.functions';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_site')({
    // One session read per navigation (cookie-cached, no database hit) so the header and
    // entry pages can show author controls without a separate admin shell.
    beforeLoad: async () => ({ session: await getSessionServerFn() }),
    component: SiteLayout,
});

function SiteLayout() {
    return (
        <div className='flex min-h-svh flex-col'>
            <SiteHeader />
            <main className='flex-1'>
                <Outlet />
            </main>
            <SiteFooter />
        </div>
    );
}
