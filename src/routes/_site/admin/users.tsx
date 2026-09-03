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
            <Table className='mt-6'>
                <TableHeader>
                    <TableRow>
                        <TableHead>Person</TableHead>
                        <TableHead className='hidden sm:table-cell'>Role</TableHead>
                        <TableHead className='hidden md:table-cell'>Joined</TableHead>
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
                            <TableCell className='hidden sm:table-cell'>
                                {u.role === 'admin' ? (
                                    <Badge>Author</Badge>
                                ) : (
                                    <Badge variant='secondary'>Reader</Badge>
                                )}
                            </TableCell>
                            <TableCell className='text-muted-foreground hidden tabular-nums md:table-cell'>
                                {formatDate(u.createdAt)}
                            </TableCell>
                            <TableCell>
                                {u.banned ? (
                                    <div>
                                        <Badge variant='destructive'>Banned</Badge>
                                        <p className='text-muted-foreground mt-1 max-w-xs text-xs'>
                                            {u.banReason}
                                            {u.banExpires
                                                ? ` · until ${formatDate(u.banExpires)}`
                                                : ''}
                                        </p>
                                    </div>
                                ) : (
                                    <span className='text-muted-foreground text-sm'>Active</span>
                                )}
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
