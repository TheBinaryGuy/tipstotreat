import { Mark } from '@/components/site/mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/features/auth/components/user-menu';
import { kindMeta } from '@/lib/format';
import { Link, useLocation, useNavigate, useRouteContext } from '@tanstack/react-router';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { PenLineIcon, SearchIcon } from 'lucide-react';

export function SiteHeader() {
    const navigate = useNavigate();
    const { session } = useRouteContext({ from: '/_site' });
    const location = useLocation();

    return (
        <header className='border-b'>
            <div className='mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4'>
                <Link
                    className='order-1 flex items-center gap-2 font-semibold tracking-tight'
                    to='/'>
                    <Mark className='text-primary size-5' />
                    TipsToTreat
                </Link>

                <nav
                    aria-label='Sections'
                    className='order-3 flex items-center gap-4 text-sm sm:order-2'>
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
                    {session?.user.role === 'admin' ? (
                        <Link
                            activeProps={{ className: 'text-foreground' }}
                            className='text-primary hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors'
                            to='/admin'>
                            <PenLineIcon className='size-3.5' /> Author
                        </Link>
                    ) : null}
                </nav>

                <form
                    action='/search'
                    className='order-4 min-w-0 flex-1 sm:order-3 sm:ml-auto sm:w-56 sm:flex-none'
                    method='get'
                    onSubmit={event => {
                        event.preventDefault();
                        const q = new FormData(event.currentTarget).get('q');
                        if (typeof q === 'string' && q.trim()) {
                            void navigate({ to: '/search', search: { q: q.trim() } });
                        }
                    }}
                    role='search'>
                    <label className='sr-only' htmlFor='site-search'>
                        Search
                    </label>
                    <InputGroup>
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                            autoComplete='off'
                            id='site-search'
                            name='q'
                            placeholder='Search'
                            type='search'
                        />
                    </InputGroup>
                </form>

                <div className='order-2 ml-auto flex items-center gap-2 sm:order-4 sm:ml-0'>
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
