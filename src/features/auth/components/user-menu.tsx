import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SessionUser } from '@/features/auth/shared/types';
import { authClient } from '@/lib/auth-client';
import { Link, useRouter } from '@tanstack/react-router';
import { LogOutIcon, PenLineIcon, SettingsIcon } from 'lucide-react';

export function UserMenu({ user }: { user: SessionUser }) {
    const router = useRouter();
    const initials = user.name
        .split(/\s+/)
        .map(part => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

    async function signOut() {
        await authClient.signOut();
        await router.invalidate();
        await router.navigate({ to: '/' });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button aria-label='Account menu' size='icon' variant='ghost' />}>
                <Avatar className='size-7'>
                    {user.image ? <AvatarImage alt='' src={user.image} /> : null}
                    <AvatarFallback className='text-xs'>{initials || '?'}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        <span className='block truncate font-medium'>{user.name}</span>
                        <span className='text-muted-foreground block truncate text-xs font-normal'>
                            {user.email}
                        </span>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                {user.role === 'admin' ? (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem render={<Link to='/admin' />}>
                            <PenLineIcon /> Author panel
                        </DropdownMenuItem>
                    </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link to='/account' />}>
                    <SettingsIcon /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void signOut()}>
                    <LogOutIcon /> Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
