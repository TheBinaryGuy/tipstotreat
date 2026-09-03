import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CopyIcon, ShieldCheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function TwoFactorCard({
    enabled,
    hasPassword,
}: {
    enabled: boolean;
    hasPassword: boolean;
}) {
    const queryClient = useQueryClient();
    const [password, setPassword] = useState('');
    const [setup, setSetup] = useState<{ totpURI: string; backupCodes: string[] } | null>(null);
    const [qr, setQr] = useState<string | null>(null);
    const [code, setCode] = useState('');

    useEffect(() => {
        if (!setup) {
            setQr(null);
            return;
        }
        if (import.meta.env.SSR) return;
        // Loaded on demand in the browser only; the QR library stays out of the Worker bundle.
        import('qrcode')
            .then(QRCode => QRCode.toDataURL(setup.totpURI, { margin: 1, width: 220 }))
            .then(setQr)
            .catch(() => setQr(null));
    }, [setup]);

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['account'] });

    const enable = useMutation({
        mutationFn: async () => {
            const result = await authClient.twoFactor.enable({ password });
            if (result.error)
                throw new Error(result.error.message ?? 'Could not start two-factor setup');
            return result.data;
        },
        onSuccess: data => {
            if (data.method === 'totp')
                setSetup({ totpURI: data.totpURI, backupCodes: data.backupCodes });
            else toast.error('Unexpected two-factor method');
        },
        onError: error => toast.error(error.message),
    });
    const verify = useMutation({
        mutationFn: async () => {
            const result = await authClient.twoFactor.verifyTotp({ code: code.trim() });
            if (result.error) throw new Error(result.error.message ?? 'That code did not match');
        },
        onSuccess: async () => {
            await refresh();
            toast.success('Two-factor authentication is on');
            setCode('');
            setPassword('');
        },
        onError: error => toast.error(error.message),
    });
    const disable = useMutation({
        mutationFn: async () => {
            const result = await authClient.twoFactor.disable({ password });
            if (result.error)
                throw new Error(result.error.message ?? 'Could not turn off two-factor');
        },
        onSuccess: async () => {
            await refresh();
            setPassword('');
            setSetup(null);
            toast.success('Two-factor authentication is off');
        },
        onError: error => toast.error(error.message),
    });

    const secret = setup ? new URL(setup.totpURI).searchParams.get('secret') : null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <ShieldCheckIcon className='size-4' /> Two-factor authentication
                    {enabled ? <Badge>On</Badge> : <Badge variant='secondary'>Off</Badge>}
                </CardTitle>
                <CardDescription>
                    Optional. A six-digit code from an authenticator app (Google Authenticator,
                    1Password, Authy) is asked for after your password.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {!hasPassword ? (
                    <Alert>
                        <AlertTitle>Set a password first</AlertTitle>
                        <AlertDescription>
                            Two-factor setup confirms your identity with your password.
                        </AlertDescription>
                    </Alert>
                ) : setup && !enabled ? (
                    <div className='space-y-4'>
                        <p className='text-sm'>
                            1. Scan this with your authenticator app, or enter the key by hand.
                        </p>
                        <div className='flex flex-wrap items-start gap-4'>
                            {qr ? (
                                <img
                                    alt='Two-factor QR code'
                                    className='rounded-md border'
                                    height={220}
                                    src={qr}
                                    width={220}
                                />
                            ) : null}
                            <div className='min-w-0 text-sm'>
                                <p className='text-muted-foreground'>Setup key</p>
                                <code className='bg-muted mt-1 block rounded px-2 py-1 font-mono text-xs break-all'>
                                    {secret}
                                </code>
                                <Button
                                    className='mt-2'
                                    onClick={() => {
                                        void navigator.clipboard.writeText(secret ?? '');
                                        toast('Key copied');
                                    }}
                                    size='sm'
                                    type='button'
                                    variant='ghost'>
                                    <CopyIcon data-icon='inline-start' /> Copy key
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className='text-sm'>
                                2. Save these backup codes somewhere safe. Each works once if you
                                lose your phone.
                            </p>
                            <div className='bg-muted mt-2 grid grid-cols-2 gap-1 rounded-md p-3 font-mono text-sm sm:grid-cols-5'>
                                {setup.backupCodes.map(c => (
                                    <span key={c}>{c}</span>
                                ))}
                            </div>
                            <Button
                                className='mt-2'
                                onClick={() => {
                                    void navigator.clipboard.writeText(
                                        setup.backupCodes.join('\n')
                                    );
                                    toast('Backup codes copied');
                                }}
                                size='sm'
                                type='button'
                                variant='ghost'>
                                <CopyIcon data-icon='inline-start' /> Copy codes
                            </Button>
                        </div>
                        <form
                            className='flex flex-col gap-3 sm:flex-row sm:items-end'
                            onSubmit={event => {
                                event.preventDefault();
                                verify.mutate();
                            }}>
                            <Field className='flex-1'>
                                <FieldLabel htmlFor='totp-code'>
                                    3. Enter the code the app shows
                                </FieldLabel>
                                <Input
                                    autoComplete='one-time-code'
                                    id='totp-code'
                                    inputMode='numeric'
                                    onChange={e => setCode(e.target.value)}
                                    placeholder='123456'
                                    value={code}
                                />
                            </Field>
                            <Button
                                disabled={verify.isPending || code.trim().length < 6}
                                type='submit'>
                                {verify.isPending ? 'Checking…' : 'Turn on'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <form
                        className='flex flex-col gap-3 sm:flex-row sm:items-end'
                        onSubmit={event => {
                            event.preventDefault();
                            if (enabled) disable.mutate();
                            else enable.mutate();
                        }}>
                        <Field className='flex-1'>
                            <FieldLabel htmlFor='tf-password'>Your password</FieldLabel>
                            <Input
                                autoComplete='current-password'
                                id='tf-password'
                                onChange={e => setPassword(e.target.value)}
                                type='password'
                                value={password}
                            />
                            <FieldDescription>
                                Needed to {enabled ? 'turn two-factor off' : 'start the setup'}.
                            </FieldDescription>
                        </Field>
                        <Button
                            disabled={!password || enable.isPending || disable.isPending}
                            type='submit'
                            variant={enabled ? 'outline' : 'default'}>
                            {enabled
                                ? disable.isPending
                                    ? 'Turning off…'
                                    : 'Turn off'
                                : enable.isPending
                                  ? 'Starting…'
                                  : 'Set up'}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
