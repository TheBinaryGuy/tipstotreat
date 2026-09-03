import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export const Route = createFileRoute('/_site/two-factor')({
    validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
    head: () => ({
        meta: [{ title: 'Two-factor code · TipsToTreat' }, { name: 'robots', content: 'noindex' }],
    }),
    component: TwoFactorPage,
});

function TwoFactorPage() {
    const { redirect } = Route.useSearch();
    const router = useRouter();
    const [code, setCode] = useState('');
    const [useBackup, setUseBackup] = useState(false);
    const [trust, setTrust] = useState(true);
    const [pending, setPending] = useState(false);
    const target =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';

    async function submit() {
        setPending(true);
        const result = useBackup
            ? await authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice: trust })
            : await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice: trust });
        setPending(false);
        if (result.error) {
            toast.error(result.error.message ?? 'That code did not match');
            return;
        }
        await router.invalidate();
        await router.navigate({ href: target });
    }

    return (
        <div className='mx-auto max-w-sm px-5 pt-12 pb-6'>
            <h1 className='text-2xl font-semibold tracking-tight'>One more step</h1>
            <p className='text-muted-foreground mt-2'>
                {useBackup
                    ? 'Enter one of your backup codes.'
                    : 'Enter the six-digit code from your authenticator app.'}
            </p>
            <Card className='mt-6'>
                <CardContent>
                    <form
                        className='space-y-4'
                        onSubmit={event => {
                            event.preventDefault();
                            void submit();
                        }}>
                        <Field>
                            <FieldLabel htmlFor='tf-code'>
                                {useBackup ? 'Backup code' : 'Code'}
                            </FieldLabel>
                            <Input
                                autoComplete='one-time-code'
                                autoFocus
                                id='tf-code'
                                inputMode={useBackup ? 'text' : 'numeric'}
                                onChange={e => setCode(e.target.value)}
                                value={code}
                            />
                            <FieldDescription>
                                <button
                                    className='underline underline-offset-4'
                                    onClick={() => setUseBackup(v => !v)}
                                    type='button'>
                                    {useBackup
                                        ? 'Use my authenticator app instead'
                                        : 'Lost your phone? Use a backup code'}
                                </button>
                            </FieldDescription>
                        </Field>
                        <label className='text-muted-foreground flex items-center gap-2 text-sm'>
                            <input
                                checked={trust}
                                className='accent-primary size-4'
                                onChange={e => setTrust(e.target.checked)}
                                type='checkbox'
                            />
                            Trust this device for 30 days
                        </label>
                        <Button
                            className='w-full'
                            disabled={pending || code.trim().length < 6}
                            size='lg'
                            type='submit'>
                            {pending ? 'Checking…' : 'Continue'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
