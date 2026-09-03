import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { setPasswordServerFn } from '@/features/auth/server/account.functions';
import { authClient } from '@/lib/auth-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export function PasswordCard({
    hasPassword,
    providers,
}: {
    hasPassword: boolean;
    providers: string[];
}) {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [signOutOthers, setSignOutOthers] = useState(true);
    const queryClient = useQueryClient();

    const change = useMutation({
        mutationFn: async () => {
            if (next.length < 10) throw new Error('Use at least 10 characters.');
            if (next !== confirm) throw new Error('The two passwords do not match.');
            if (hasPassword) {
                const result = await authClient.changePassword({
                    currentPassword: current,
                    newPassword: next,
                    revokeOtherSessions: signOutOthers,
                });
                if (result.error)
                    throw new Error(result.error.message ?? 'Could not change the password');
            } else {
                await setPasswordServerFn({ data: { newPassword: next } });
            }
        },
        onSuccess: async () => {
            setCurrent('');
            setNext('');
            setConfirm('');
            await queryClient.invalidateQueries({ queryKey: ['account'] });
            toast.success(hasPassword ? 'Password changed' : 'Password set');
        },
        onError: error => toast.error(error.message),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                    {hasPassword
                        ? 'Change the password you sign in with.'
                        : `You sign in with ${providers.includes('google') ? 'Google' : 'a linked account'}. Set a password to also sign in with your email.`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className='grid gap-4 sm:grid-cols-2'
                    onSubmit={event => {
                        event.preventDefault();
                        change.mutate();
                    }}>
                    {hasPassword ? (
                        <Field className='sm:col-span-2'>
                            <FieldLabel htmlFor='pw-current'>Current password</FieldLabel>
                            <Input
                                autoComplete='current-password'
                                id='pw-current'
                                onChange={e => setCurrent(e.target.value)}
                                type='password'
                                value={current}
                            />
                        </Field>
                    ) : null}
                    <Field>
                        <FieldLabel htmlFor='pw-new'>New password</FieldLabel>
                        <Input
                            autoComplete='new-password'
                            id='pw-new'
                            onChange={e => setNext(e.target.value)}
                            type='password'
                            value={next}
                        />
                        <FieldDescription>At least 10 characters.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor='pw-confirm'>New password again</FieldLabel>
                        <Input
                            autoComplete='new-password'
                            id='pw-confirm'
                            onChange={e => setConfirm(e.target.value)}
                            type='password'
                            value={confirm}
                        />
                    </Field>
                    {hasPassword ? (
                        <label className='text-muted-foreground flex items-center gap-2 text-sm sm:col-span-2'>
                            <input
                                checked={signOutOthers}
                                className='accent-primary size-4'
                                onChange={e => setSignOutOthers(e.target.checked)}
                                type='checkbox'
                            />
                            Sign out my other devices
                        </label>
                    ) : null}
                    <div className='sm:col-span-2'>
                        <Button
                            disabled={
                                change.isPending || !next || !confirm || (hasPassword && !current)
                            }
                            type='submit'>
                            {change.isPending
                                ? 'Saving…'
                                : hasPassword
                                  ? 'Change password'
                                  : 'Set password'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
