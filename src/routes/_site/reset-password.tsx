import { AuthForm } from '@/components/admin/auth-form';
import { Card, CardContent } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/_site/reset-password')({
    validateSearch: z.object({
        token: z.string().optional().catch(undefined),
        error: z.string().optional().catch(undefined),
    }),
    head: () => ({
        meta: [{ title: 'Reset password · TipsToTreat' }, { name: 'robots', content: 'noindex' }],
    }),
    component: ResetPasswordPage,
});

const schema = z
    .object({
        password: z.string().min(10, 'At least 10 characters'),
        confirm: z.string(),
    })
    .refine(v => v.password === v.confirm, {
        message: 'The two passwords do not match',
        path: ['confirm'],
    });

function ResetPasswordPage() {
    const { token, error: linkError } = Route.useSearch();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const invalid = !token || linkError === 'INVALID_TOKEN';

    return (
        <div className='mx-auto max-w-sm px-5 pt-12 pb-6'>
            <h1 className='text-2xl font-semibold tracking-tight'>Choose a new password</h1>
            <Card className='mt-6'>
                <CardContent>
                    {invalid ? (
                        <p className='text-sm'>
                            This reset link is missing or has expired.{' '}
                            <Link className='underline underline-offset-4' to='/forgot-password'>
                                Request a new one
                            </Link>
                            .
                        </p>
                    ) : (
                        <AuthForm
                            defaultValues={{ password: '', confirm: '' }}
                            error={error}
                            fields={[
                                {
                                    name: 'password',
                                    label: 'New password',
                                    hint: 'At least 10 characters.',
                                    input: { type: 'password', autoComplete: 'new-password' },
                                },
                                {
                                    name: 'confirm',
                                    label: 'New password again',
                                    input: { type: 'password', autoComplete: 'new-password' },
                                },
                            ]}
                            onSubmit={async values => {
                                setError(null);
                                const result = await authClient.resetPassword({
                                    newPassword: values.password ?? '',
                                    token,
                                });
                                if (result.error) {
                                    setError(
                                        result.error.message ?? 'Could not reset the password.'
                                    );
                                    return;
                                }
                                await router.navigate({ to: '/sign-in' });
                            }}
                            pendingLabel='Saving…'
                            schema={schema}
                            submitLabel='Set new password'
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
