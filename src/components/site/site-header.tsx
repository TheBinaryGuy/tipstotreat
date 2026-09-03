import { Mark } from '@/components/site/mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/features/auth/components/user-menu';
import { kindMeta } from '@/lib/format';
import { Link, useLocation, useNavigate, useRouteContext } from '@tanstack/react-router';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { SearchIcon } from 'lucide-react';

export function SiteHeader() {
    const navigate = useNavigate();
    const { session } = useRouteContext({ from: '/_site' });
    const location = useLocation();

    return (
        <header className='border-b'>
            <div className='mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4'>
                <Link className='flex items-center gap-2 font-semibold tracking-tight' to='/'>
                    <Mark className='text-primary size-5' />
                    TipsToTreat
                </Link>

                <nav aria-label='Sections' className='flex items-center gap-4 text-sm'>
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

                <form
                    action='/search'
                    className='relative ml-auto w-full sm:w-56'
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

                <div className='flex items-center gap-2'>
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
                    <div className='hidden sm:block'>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
