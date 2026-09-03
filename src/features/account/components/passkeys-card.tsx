import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { formatDate } from '@/lib/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRoundIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function PasskeysCard() {
    const queryClient = useQueryClient();
    const list = useQuery({
        queryKey: ['account', 'passkeys'],
        queryFn: async () => {
            const result = await authClient.passkey.listUserPasskeys();
            if (result.error) throw new Error(result.error.message ?? 'Could not load passkeys');
            return result.data;
        },
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['account', 'passkeys'] });
    const add = useMutation({
        mutationFn: async () => {
            const name =
                window.prompt('Name this passkey (e.g. "iPhone", "Laptop")', navigator.platform) ??
                undefined;
            const result = await authClient.passkey.addPasskey({ name: name || undefined });
            if (result?.error) throw new Error(result.error.message ?? 'Could not add the passkey');
        },
        onSuccess: async () => {
            await refresh();
            toast.success('Passkey added');
        },
        onError: error => toast.error(error.message),
    });
    const remove = useMutation({
        mutationFn: async (id: string) => {
            const result = await authClient.passkey.deletePasskey({ id });
            if (result.error)
                throw new Error(result.error.message ?? 'Could not remove the passkey');
        },
        onSuccess: refresh,
        onError: error => toast.error(error.message),
    });
    const [supported, setSupported] = useState(true);
    useEffect(() => setSupported('PublicKeyCredential' in window), []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <KeyRoundIcon className='size-4' /> Passkeys
                </CardTitle>
                <CardDescription>
                    Optional. Sign in with your face, fingerprint, or device PIN instead of a
                    password.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {list.data && list.data.length > 0 ? (
                    <ul className='divide-y rounded-md border'>
                        {list.data.map(key => (
                            <li
                                className='flex items-center justify-between gap-3 px-3 py-2 text-sm'
                                key={key.id}>
                                <div>
                                    <p className='font-medium'>{key.name || 'Passkey'}</p>
                                    <p className='text-muted-foreground text-xs'>
                                        {key.deviceType === 'multiDevice'
                                            ? 'Synced'
                                            : 'This device'}{' '}
                                        · added {formatDate(key.createdAt ?? new Date())}
                                    </p>
                                </div>
                                <Button
                                    aria-label='Remove passkey'
                                    disabled={remove.isPending}
                                    onClick={() => remove.mutate(key.id)}
                                    size='icon-sm'
                                    variant='ghost'>
                                    <Trash2Icon />
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-muted-foreground text-sm'>No passkeys yet.</p>
                )}
                <Button
                    disabled={!supported || add.isPending}
                    onClick={() => add.mutate()}
                    size='sm'
                    type='button'
                    variant='outline'>
                    <PlusIcon data-icon='inline-start' />{' '}
                    {add.isPending ? 'Waiting for your device…' : 'Add a passkey'}
                </Button>
                {!supported ? (
                    <p className='text-muted-foreground text-xs'>
                        This browser does not support passkeys.
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
