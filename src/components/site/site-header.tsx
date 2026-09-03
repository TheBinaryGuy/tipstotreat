import { Mark } from '@/components/site/mark';
import { SearchDialog } from '@/components/site/search-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenu } from '@/features/auth/components/user-menu';
import { kindMeta } from '@/lib/format';
import { Link, useLocation, useRouteContext } from '@tanstack/react-router';
import { MenuIcon, PenLineIcon } from 'lucide-react';

const KINDS = ['remedy', 'tip', 'recipe'] as const;

export function SiteHeader() {
    const { session } = useRouteContext({ from: '/_site' });
    const location = useLocation();

    return (
        <header className='border-b'>
            <div className='mx-auto flex h-16 max-w-4xl items-center gap-6 px-5'>
                <Link className='flex items-center gap-2 font-semibold tracking-tight' to='/'>
                    <Mark className='text-primary size-5' />
                    TipsToTreat
                </Link>

                <nav aria-label='Sections' className='hidden items-center gap-5 text-sm md:flex'>
                    {KINDS.map(kind => (
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
                    <SearchDialog />
                    <ThemeToggle />
                    {session ? (
                        <UserMenu user={session.user} />
                    ) : (
                        <Button
                            className='hidden md:inline-flex'
                            render={<Link search={{ redirect: location.href }} to='/sign-in' />}
                            size='sm'
                            variant='outline'>
                            Sign in
                        </Button>
                    )}
                    <Sheet>
                        <SheetTrigger
                            render={<Button aria-label='Menu' className='md:hidden' size='icon' variant='outline' />}>
                            <MenuIcon />
                        </SheetTrigger>
                        <SheetContent className='w-72' side='right'>
                            <SheetHeader>
                                <SheetTitle>TipsToTreat</SheetTitle>
                                <SheetDescription>Home remedies, tips and recipes.</SheetDescription>
                            </SheetHeader>
                            <nav aria-label='Sections' className='flex flex-col px-4'>
                                {KINDS.map(kind => (
                                    <SheetClose
                                        key={kind}
                                        render={
                                            <Link
                                                activeProps={{ className: 'text-foreground font-medium' }}
                                                className='text-muted-foreground hover:text-foreground border-b py-3 text-lg transition-colors'
                                                params={{ kind: kindMeta[kind].path }}
                                                to='/$kind'
                                            />
                                        }>
                                        {kindMeta[kind].plural}
                                    </SheetClose>
                                ))}
                                {session?.user.role === 'admin' ? (
                                    <SheetClose
                                        render={
                                            <Link
                                                className='text-muted-foreground hover:text-foreground inline-flex items-center gap-2 border-b py-3 text-lg transition-colors'
                                                to='/admin'
                                            />
                                        }>
                                        <PenLineIcon className='size-4' /> Author panel
                                    </SheetClose>
                                ) : null}
                                {!session ? (
                                    <SheetClose
                                        render={
                                            <Button
                                                className='mt-4'
                                                render={<Link search={{ redirect: location.href }} to='/sign-in' />}
                                            />
                                        }>
                                        Sign in
                                    </SheetClose>
                                ) : null}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
