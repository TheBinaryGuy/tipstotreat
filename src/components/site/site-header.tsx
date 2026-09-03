import { ExpandingSearch } from '@/components/site/expanding-search';
import { Mark } from '@/components/site/mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/features/auth/components/user-menu';
import { kindMeta } from '@/lib/format';
import { Link, useLocation, useRouteContext } from '@tanstack/react-router';

export function SiteHeader() {
    const { session } = useRouteContext({ from: '/_site' });
    const location = useLocation();

    return (
        <header className='border-b'>
            <div className='mx-auto flex max-w-4xl flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4'>
                <Link className='flex items-center gap-2 font-semibold tracking-tight' to='/'>
                    <Mark className='text-primary size-5' />
                    TipsToTreat
                </Link>

                <nav
                    aria-label='Sections'
                    className='order-3 flex items-center gap-4 text-sm sm:order-none'>
                    {(['remedy', 'tip', 'recipe'] as const).map(kind => (
                        <Link
                            activeProps={{ className: 'text-foreground' }}
                            className='text-muted-foreground hover:text-foreground transition-colors'
                            key={kind}
                            params={{ kind: kindMeta[kind].path }}
                            to='/$kind'>
                            {kindMeta[kind].plural}
                        </Link>
                    ))}
                </nav>

                <div className='ml-auto flex items-center gap-2'>
                    <ExpandingSearch />
                    {session ? (
                        <UserMenu user={session.user} />
                    ) : (
                        <Button
                            render={<Link search={{ redirect: location.href }} to='/sign-in' />}
                            size='sm'
                            variant='outline'>
                            Sign in
                        </Button>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
