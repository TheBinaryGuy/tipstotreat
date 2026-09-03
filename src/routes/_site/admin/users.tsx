import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BanDialog } from '@/features/admin/components/ban-dialog';
import {
    adminSetRoleServerFn,
    adminUnbanUserServerFn,
} from '@/features/admin/server/admin.functions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { adminKeys, adminUsersQuery } from '@/features/admin/shared/queries';
import { formatDate } from '@/lib/format';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_site/admin/users')({
    loader: ({ context }) => context.queryClient.ensureQueryData(adminUsersQuery()),
    head: () => ({ meta: [{ title: 'Users · Author · TipsToTreat' }] }),
    component: UsersPage,
});

function initials(name: string) {
    return (
        name
            .split(/\s+/)
            .map(part => part[0] ?? '')
            .join('')
            .slice(0, 2)
            .toUpperCase() || '?'
    );
}

function UsersPage() {
    const { data: users } = useSuspenseQuery(adminUsersQuery());
    const { session } = Route.useRouteContext();
    const queryClient = useQueryClient();
    const unban = useMutation({
        mutationFn: adminUnbanUserServerFn,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: adminKeys.users });
            toast.success('Ban lifted');
        },
        onError: error => toast.error(error.message),
    });
    const setRole = useMutation({
        mutationFn: adminSetRoleServerFn,
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: adminKeys.users });
            toast.success(
                variables.data.role === 'admin' ? 'Made an author' : 'Author role removed'
            );
        },
        onError: error => toast.error(error.message),
    });
    const banned = users.filter(u => u.banned).length;

    return (
        <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Users</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
                {users.length} {users.length === 1 ? 'account' : 'accounts'}
                {banned ? ` · ${banned} banned` : ''}
            </p>
            <ul className='mt-6 space-y-3 md:hidden'>
                {users.map(u => (
                    <li className='bg-card rounded-lg border p-4' key={u.id}>
                        <div className='flex items-center gap-3'>
                            <Avatar className='size-10'>
                                {u.image ? <AvatarImage alt='' src={u.image} /> : null}
                                <AvatarFallback>{initials(u.name)}</AvatarFallback>
                            </Avatar>
                            <div className='min-w-0 flex-1'>
                                <p className='truncate font-medium'>{u.name}</p>
                                <p className='text-muted-foreground truncate text-sm'>{u.email}</p>
                            </div>
                            {u.role === 'admin' ? (
                                <Badge>Author</Badge>
                            ) : (
                                <Badge variant='secondary'>Reader</Badge>
                            )}
                        </div>
                        <div className='text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                            <span className='tabular-nums'>Joined {formatDate(u.createdAt)}</span>
                            <span aria-hidden>·</span>
                            <UserStatus user={u} />
                        </div>
                        {u.id === session?.user.id ? null : (
                            <div className='mt-3 flex flex-wrap justify-end gap-2 border-t pt-3'>
                                <RoleButton
                                    onConfirm={role =>
                                        setRole.mutate({ data: { userId: u.id, role } })
                                    }
                                    pending={setRole.isPending}
                                    user={u}
                                />
                                {u.role === 'admin' ? null : u.banned ? (
                                    <Button
                                        disabled={unban.isPending}
                                        onClick={() => unban.mutate({ data: { userId: u.id } })}
                                        size='sm'
                                        variant='outline'>
                                        Unban
                                    </Button>
                                ) : (
                                    <BanDialog user={u} />
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <Table className='mt-6 hidden md:table'>
                <TableHeader>
                    <TableRow>
                        <TableHead>Person</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(u => (
                        <TableRow key={u.id}>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <Avatar className='size-8'>
                                        {u.image ? <AvatarImage alt='' src={u.image} /> : null}
                                        <AvatarFallback className='text-xs'>
                                            {initials(u.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='min-w-0'>
                                        <p className='truncate font-medium'>{u.name}</p>
                                        <p className='text-muted-foreground truncate text-sm'>
                                            {u.email}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {u.role === 'admin' ? (
                                    <Badge>Author</Badge>
                                ) : (
                                    <Badge variant='secondary'>Reader</Badge>
                                )}
                            </TableCell>
                            <TableCell className='text-muted-foreground tabular-nums'>
                                {formatDate(u.createdAt)}
                            </TableCell>
                            <TableCell>
                                <UserStatus user={u} />
                            </TableCell>
                            <TableCell className='text-right'>
                                {u.id === session?.user.id ? null : (
                                    <div className='inline-flex items-center gap-2'>
                                        <RoleButton
                                            onConfirm={role =>
                                                setRole.mutate({ data: { userId: u.id, role } })
                                            }
                                            pending={setRole.isPending}
                                            user={u}
                                        />
                                        {u.role === 'admin' ? null : u.banned ? (
                                            <Button
                                                disabled={unban.isPending}
                                                onClick={() =>
                                                    unban.mutate({ data: { userId: u.id } })
                                                }
                                                size='sm'
                                                variant='outline'>
                                                Unban
                                            </Button>
                                        ) : (
                                            <BanDialog user={u} />
                                        )}
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function UserStatus({
    user,
}: {
    user: { banned: boolean; banReason: string | null; banExpires: Date | null };
}) {
    if (!user.banned) return <span className='text-muted-foreground text-sm'>Active</span>;
    return (
        <span className='inline-flex flex-wrap items-center gap-x-2 gap-y-1'>
            <Badge variant='destructive'>Banned</Badge>
            <span className='text-muted-foreground text-xs'>
                {user.banReason}
                {user.banExpires ? ` · until ${formatDate(user.banExpires)}` : ''}
            </span>
        </span>
    );
}

function RoleButton({
    user,
    pending,
    onConfirm,
}: {
    user: { name: string; role: 'admin' | 'user'; banned: boolean };
    pending: boolean;
    onConfirm: (role: 'admin' | 'user') => void;
}) {
    if (user.role === 'admin') {
        return (
            <Button disabled={pending} onClick={() => onConfirm('user')} size='sm' variant='ghost'>
                Remove author
            </Button>
        );
    }
    if (user.banned) return null;
    return (
        <AlertDialog>
            <AlertDialogTrigger render={<Button disabled={pending} size='sm' variant='ghost' />}>
                Make author
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Make {user.name} an author?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Authors can write and publish entries, manage users, ban readers, and delete
                        any comment. You can remove the role later.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm('admin')}>
                        Make author
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
