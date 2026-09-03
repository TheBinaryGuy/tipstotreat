import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { formatDate } from '@/lib/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MonitorSmartphoneIcon } from 'lucide-react';
import { toast } from 'sonner';

function describe(userAgent: string | null | undefined) {
    if (!userAgent) return 'Unknown device';
    const browser = /Edg\//.test(userAgent)
        ? 'Edge'
        : /Chrome\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : /Firefox\//.test(userAgent)
              ? 'Firefox'
              : 'Browser';
    const os = /iPhone|iPad/.test(userAgent)
        ? 'iOS'
        : /Android/.test(userAgent)
          ? 'Android'
          : /Mac OS/.test(userAgent)
            ? 'macOS'
            : /Windows/.test(userAgent)
              ? 'Windows'
              : /Linux/.test(userAgent)
                ? 'Linux'
                : '';
    return [browser, os].filter(Boolean).join(' on ');
}

export function SessionsCard() {
    const queryClient = useQueryClient();
    const current = authClient.useSession();
    const sessions = useQuery({
        queryKey: ['account', 'sessions'],
        queryFn: async () => {
            const result = await authClient.listSessions();
            if (result.error) throw new Error(result.error.message ?? 'Could not load sessions');
            return result.data;
        },
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['account', 'sessions'] });
    const revoke = useMutation({
        mutationFn: async (token: string) => {
            const result = await authClient.revokeSession({ token });
            if (result.error)
                throw new Error(result.error.message ?? 'Could not sign out that device');
        },
        onSuccess: refresh,
        onError: error => toast.error(error.message),
    });
    const revokeOthers = useMutation({
        mutationFn: async () => {
            const result = await authClient.revokeOtherSessions();
            if (result.error)
                throw new Error(result.error.message ?? 'Could not sign out other devices');
        },
        onSuccess: async () => {
            await refresh();
            toast.success('Other devices signed out');
        },
        onError: error => toast.error(error.message),
    });
    const currentToken = current.data?.session.token;

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <MonitorSmartphoneIcon className='size-4' /> Where you're signed in
                </CardTitle>
                <CardDescription>
                    Every device with an open session. Sign out any you don't recognise.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <ul className='divide-y rounded-md border'>
                    {(sessions.data ?? []).map(s => {
                        const isCurrent = s.token === currentToken;
                        return (
                            <li
                                className='flex items-center justify-between gap-3 px-3 py-2 text-sm'
                                key={s.id}>
                                <div>
                                    <p className='flex items-center gap-2 font-medium'>
                                        {describe(s.userAgent)}
                                        {isCurrent ? (
                                            <Badge variant='secondary'>This device</Badge>
                                        ) : null}
                                    </p>
                                    <p className='text-muted-foreground text-xs'>
                                        {s.ipAddress || 'unknown address'} · signed in{' '}
                                        {formatDate(s.createdAt)} · expires{' '}
                                        {formatDate(s.expiresAt)}
                                    </p>
                                </div>
                                {!isCurrent ? (
                                    <Button
                                        disabled={revoke.isPending}
                                        onClick={() => revoke.mutate(s.token)}
                                        size='sm'
                                        variant='ghost'>
                                        Sign out
                                    </Button>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
                {(sessions.data?.length ?? 0) > 1 ? (
                    <Button
                        disabled={revokeOthers.isPending}
                        onClick={() => revokeOthers.mutate()}
                        size='sm'
                        variant='outline'>
                        Sign out all other devices
                    </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
