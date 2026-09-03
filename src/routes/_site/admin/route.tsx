import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { LockIcon, MessageSquareIcon, UsersIcon } from 'lucide-react';

export const Route = createFileRoute('/_site/admin')({
    beforeLoad: ({ context, location }) => {
        if (!context.session) {
            throw redirect({ to: '/sign-in', search: { redirect: location.href } });
        }
    },
    head: () => ({
        meta: [{ title: 'Author · TipsToTreat' }, { name: 'robots', content: 'noindex' }],
    }),
    component: AdminLayout,
});

function AdminLayout() {
    const { session } = Route.useRouteContext();

    if (session?.user.role !== 'admin') {
        return (
            <div className='mx-auto max-w-4xl px-5 pt-10'>
                <Empty className='border border-dashed'>
                    <EmptyHeader>
                        <EmptyMedia variant='icon'>
                            <LockIcon />
                        </EmptyMedia>
                        <EmptyTitle>Author only</EmptyTitle>
                        <EmptyDescription>
                            You are signed in, but this area is for the site's author. You can still
                            like entries and comment on them.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button render={<Link to='/' />} variant='outline'>
                            Back to the front page
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    return (
        <div className='mx-auto max-w-4xl px-5 pt-6'>
            <nav
                aria-label='Author'
                className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-3 text-sm'>
                <Link
                    activeOptions={{ exact: true }}
                    activeProps={{ className: 'text-foreground font-medium' }}
                    className='hover:text-foreground transition-colors'
                    to='/admin'>
                    Entries
                </Link>
                <Link
                    activeProps={{ className: 'text-foreground font-medium' }}
                    className='hover:text-foreground inline-flex items-center gap-1 transition-colors'
                    to='/admin/users'>
                    <UsersIcon className='size-3.5' /> Users
                </Link>
                <Link
                    activeProps={{ className: 'text-foreground font-medium' }}
                    className='hover:text-foreground inline-flex items-center gap-1 transition-colors'
                    to='/admin/comments'>
                    <MessageSquareIcon className='size-3.5' /> Comments
                </Link>
            </nav>
            <div className='py-6'>
                <Outlet />
            </div>
        </div>
    );
}
